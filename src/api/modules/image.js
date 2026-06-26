import http from '../http'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function authHeaders() {
  const token = localStorage.getItem('aigc_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getImageList(params) {
  return http.get('/pc/video/list', { params })
}

export function createTextToImage(data) {
  return http.post('/pc/image/generate', data)
}

export function getImageDetail(id) {
  return http.get(`/pc/video/${id}`)
}

// 流式优化提示词：onChunk 会在每个 content 片段到达时被调用
export function optimizePromptStream(data, onChunk) {
  return fetch(`${BASE_URL}/pc/prompt/optimize/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // 按 \n\n 切分 SSE 事件
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        const line = part.split('\n').find(l => l.startsWith('data:'))
        if (!line) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const json = JSON.parse(payload)
          if (json && typeof json.content === 'string' && json.content.length > 0) {
            onChunk(json.content)
          }
        } catch {
          // ignore parse errors, wait for more data
        }
      }
    }
  })
}