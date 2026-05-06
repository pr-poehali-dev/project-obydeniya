import { useState, useEffect, useRef } from "react"
import Icon from "@/components/ui/icon"

const SEARCH_URL = "https://functions.poehali.dev/3e835291-d425-41e2-9813-89d120fb843c"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setAnswer("")
      setError("")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return
    setIsLoading(true)
    setAnswer("")
    setError("")

    try {
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      if (data.answer) {
        setAnswer(data.answer)
      } else {
        setError("Не удалось получить ответ. Попробуйте ещё раз.")
      }
    } catch {
      setError("Ошибка соединения. Проверьте интернет.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Icon name="Search" size={18} className="text-white/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос о нас..."
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none font-sans text-sm"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setAnswer(""); setError("") }}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="shrink-0 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs text-white/80 font-mono transition-all"
          >
            {isLoading ? "..." : "↵"}
          </button>
        </div>

        {(isLoading || answer || error) && (
          <div className="px-5 py-4">
            {isLoading && (
              <div className="flex items-center gap-3 text-white/50">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono">AI думает...</span>
              </div>
            )}

            {answer && !isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/40">
                  <Icon name="Sparkles" size={12} />
                  <span className="text-xs font-mono">AI-ответ</span>
                </div>
                <p className="text-sm text-white/85 leading-relaxed font-sans">{answer}</p>
              </div>
            )}

            {error && !isLoading && (
              <p className="text-sm text-red-400/80 font-sans">{error}</p>
            )}
          </div>
        )}

        {!isLoading && !answer && !error && (
          <div className="px-5 py-4">
            <p className="text-xs text-white/30 font-mono">Нажмите Enter или кнопку для поиска · Esc для закрытия</p>
          </div>
        )}
      </div>
    </div>
  )
}
