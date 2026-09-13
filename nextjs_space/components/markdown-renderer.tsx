'use client'

import dynamic from 'next/dynamic'

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
