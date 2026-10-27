import { useState } from "react"
import { HeroCarousel } from "@/components/ui/hero-carousel"
import { categories } from "@/mocks/categories"

export function NewsPage() {
  const [index, setIndex] = useState(0)
  const category = categories[index]
  const isAll = category.id === "all"

  return (
    <>
      <a href="#news-feed" className="skip-link">Перейти к ленте новостей</a>

      <header className="site-header page-width">
        <a className="wordmark" href="/" aria-label="QUE — главная страница">QUE<span aria-hidden="true">.</span></a>
        <span className="site-description">Новостной портал</span>
        <span className="prototype-badge">Прототип интерфейса</span>
      </header>

      <main className="page-width">
        <section className="rubrics-section" aria-labelledby="rubrics-heading">
          <div className="rubrics-toolbar">
            <h1 id="rubrics-heading" className="eyebrow">Обзор рубрик</h1>
            <span className="rubrics-hint">Разные темы. Общая картина.</span>
          </div>

          <nav className="category-nav" aria-label="Выбор рубрики">
            {categories.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={index === itemIndex}
                aria-controls="news-feed"
                onClick={() => setIndex(itemIndex)}
                className="category-button"
              >
                {item.title}
              </button>
            ))}
          </nav>

          <HeroCarousel
            items={categories}
            index={index}
            onIndexChange={setIndex}
            className="category-hero"
          />
        </section>

        <section id="news-feed" className="news-section" aria-labelledby="feed-heading" tabIndex={-1}>
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
        <span>QUE · Новостной портал</span>
        <span>Изображения рубрик — демонстрационные</span>
      </footer>
    </>
  )
}
