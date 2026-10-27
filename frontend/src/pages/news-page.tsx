import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CategorySelector } from "@/components/ui/category-selector"
import { categories } from "@/mocks/categories"

export function NewsPage() {
  const [index, setIndex] = useState(0)
  const category = categories[index]
  const isAll = category.id === "all"
  const reduced = useReducedMotion()

  return (
    <div className="news-page">
      <AnimatePresence initial={false}>
        <motion.div
          key={category.id}
          aria-hidden="true"
          className="page-background"
          style={{ backgroundColor: category.accent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.55 }}
        >
          <div className="page-background-photo" style={{ backgroundImage: `url("${category.image}")` }} />
          <div className="page-background-wash" />
        </motion.div>
      </AnimatePresence>
      <a href="#news-feed" className="skip-link">Перейти к ленте новостей</a>

      <header className="site-header page-width">
        <a className="wordmark" href="/" aria-label="QUE — главная страница">QUE<span aria-hidden="true">.</span></a>
        <span className="prototype-badge">Прототип интерфейса</span>
      </header>

      <main>
        <h1 className="sr-only">Новости</h1>
        <section className="rubrics-section" aria-label="Выбор рубрики">
          <CategorySelector
            items={categories}
            index={index}
            onIndexChange={setIndex}
          />
        </section>

        <section id="news-feed" className="news-section page-width" aria-labelledby="feed-heading" tabIndex={-1}>
          <div className="feed-header">
            <div aria-live="polite" aria-atomic="true">
              <p className="eyebrow">Новостная лента</p>
              <h2 id="feed-heading">{category.title}</h2>
              <p className="feed-description">{isAll ? "Материалы всех пяти рубрик" : category.credit}</p>
            </div>
            {!isAll && (
              <button type="button" className="return-button" onClick={() => setIndex(0)}>
                <span aria-hidden="true">↖</span> Все новости
              </button>
            )}
          </div>

          <div className="feed-placeholder">
            <div className="feed-placeholder-mark" aria-hidden="true">
              <span /><span /><span />
            </div>
            <p>Здесь будет вертикальная лента новостей</p>
            <span>Область материалов · схема страницы</span>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <span>QUE</span>
        <span>Изображения рубрик — демонстрационные</span>
      </footer>
    </div>
  )
}
