import './style.css'
import { days, overview, stayById, trip } from './trip-data.js'

const params = new URLSearchParams(window.location.search)
const initialId = params.get('day')
const initialIndex = Math.max(
  0,
  days.findIndex((day) => day.id === initialId),
)

let selectedIndex = initialIndex === -1 ? 0 : initialIndex

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function typeLabel(type) {
  const labels = {
    arrive: 'Arrival',
    depart: 'Departure',
    transit: 'Getting there',
    booked: 'Booked / priced',
    plan: 'The plan',
    stay: 'Stay',
    idea: 'Idea',
    note: 'Note',
  }
  return labels[type] || 'Note'
}

function renderStayCard(stay) {
  return `
    <article class="stay-card">
      <div class="stay-card__top">
        <p class="eyebrow">${escapeHtml(stay.place)} stay</p>
        <h3>${escapeHtml(stay.name)}</h3>
        <p class="stay-card__meta">${escapeHtml(stay.guests)} · ${escapeHtml(stay.nights)}</p>
      </div>
      <dl class="stay-facts">
        <div><dt>Confirmation</dt><dd>${escapeHtml(stay.confirmation)}</dd></div>
        <div><dt>Address</dt><dd>${escapeHtml(stay.address)}</dd></div>
        <div><dt>Room</dt><dd>${escapeHtml(stay.room)}</dd></div>
        <div><dt>Check-in / out</dt><dd>${escapeHtml(stay.checkIn)} · ${escapeHtml(stay.checkOut)}</dd></div>
      </dl>
      <p class="stay-card__notes">${escapeHtml(stay.notes)}</p>
      <a class="text-link" href="${escapeHtml(stay.mapsUrl)}" target="_blank" rel="noopener">Open in Maps</a>
    </article>
  `
}

function renderDay(day, index) {
  const stays = day.stayIds.map((id) => stayById[id]).filter(Boolean)
  const prev = days[index - 1]
  const next = days[index + 1]

  return `
    <article class="day-panel" id="day-panel" aria-live="polite">
      <header class="day-panel__header">
        <p class="eyebrow">${escapeHtml(day.weekday)} · ${escapeHtml(day.shortLabel)}</p>
        <h2>${escapeHtml(day.title)}</h2>
        <p class="lede">${escapeHtml(day.summary)}</p>
        <p class="day-location">${escapeHtml(day.location)}</p>
      </header>

      <div class="day-panel__nav">
        <button type="button" class="ghost-btn" data-goto="${prev ? index - 1 : ''}" ${prev ? '' : 'disabled'}>
          ← ${prev ? escapeHtml(prev.shortLabel) : 'Start'}
        </button>
        <span>${index + 1} / ${days.length}</span>
        <button type="button" class="ghost-btn" data-goto="${next ? index + 1 : ''}" ${next ? '' : 'disabled'}>
          ${next ? escapeHtml(next.shortLabel) : 'End'} →
        </button>
      </div>

      <section class="block-stack" aria-label="Day plan">
        ${day.blocks
          .map(
            (block) => `
          <div class="plan-block plan-block--${escapeHtml(block.type)}">
            <p class="plan-block__type">${escapeHtml(typeLabel(block.type))}</p>
            <h3>${escapeHtml(block.title)}</h3>
            <p>${escapeHtml(block.body)}</p>
          </div>
        `,
          )
          .join('')}
      </section>

      <section class="stays" aria-label="Where you sleep">
        <h3 class="section-title">Where you sleep</h3>
        <div class="stay-grid">
          ${stays.map(renderStayCard).join('')}
        </div>
      </section>

      <section class="day-links" aria-label="Useful links">
        <h3 class="section-title">Links</h3>
        <ul>
          ${day.links
            .map(
              (link) => `
            <li>
              <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>
            </li>
          `,
            )
            .join('')}
        </ul>
      </section>
    </article>
  `
}

function renderApp() {
  const day = days[selectedIndex]

  document.querySelector('#app').innerHTML = `
    <a class="skip-link" href="#day-panel">Skip to selected day</a>

    <header class="site-nav">
      <div class="site-nav__brand">${escapeHtml(trip.brand)}</div>
      <a class="site-nav__source" href="${escapeHtml(trip.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(trip.sourceLabel)}</a>
    </header>

    <section class="hero">
      <div class="hero__media" aria-hidden="true">
        <img src="${escapeHtml(trip.heroImage)}" alt="" />
        <div class="hero__veil"></div>
      </div>
      <div class="hero__copy">
        <p class="brand-mark">${escapeHtml(trip.brand)}</p>
        <h1>${escapeHtml(trip.title)}</h1>
        <p class="hero__sub">${escapeHtml(trip.subtitle)}</p>
        <div class="hero__actions">
          <a class="primary-btn" href="#planner">Open day planner</a>
          <a class="secondary-btn" href="${escapeHtml(trip.sourceUrl)}" target="_blank" rel="noopener">Fora source</a>
        </div>
        <p class="hero__credit">Photo: ${escapeHtml(trip.heroCredit)} · Curated by ${escapeHtml(trip.curator.name)}</p>
      </div>
    </section>

    <main id="planner" class="planner">
      <div class="planner__intro">
        <p class="eyebrow">Itinerary</p>
        <h2>Pick a day. See the plan.</h2>
        <p>Overview for the arc — day view for the details. No more hunting through booking dumps.</p>
      </div>

      <div class="day-strip-wrap">
        <div class="day-strip" role="tablist" aria-label="Trip days">
          ${days
            .map(
              (item, index) => `
            <button
              type="button"
              class="day-chip ${index === selectedIndex ? 'is-active' : ''}"
              role="tab"
              aria-selected="${index === selectedIndex}"
              data-select="${index}"
              id="day-chip-${index}"
            >
              <span class="day-chip__date">${escapeHtml(item.shortLabel)}</span>
              <span class="day-chip__title">${escapeHtml(item.title)}</span>
            </button>
          `,
            )
            .join('')}
        </div>
      </div>

      ${renderDay(day, selectedIndex)}

      <section class="overview" aria-label="Itinerary overview">
        <div class="overview__head">
          <h2>Overview</h2>
          <p>Tap any row to jump straight to that day.</p>
        </div>
        <div class="overview-table" role="list">
          ${overview
            .map(
              (row, index) => `
            <button type="button" class="overview-row ${index === selectedIndex ? 'is-active' : ''}" data-select="${index}" role="listitem">
              <span class="overview-row__when">
                <strong>${escapeHtml(row.weekday)}</strong>
                <span>${escapeHtml(row.shortLabel)}</span>
              </span>
              <span class="overview-row__what">
                <strong>${escapeHtml(row.title)}</strong>
                <span>${escapeHtml(row.location)}</span>
              </span>
            </button>
          `,
            )
            .join('')}
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>
        Day-first viewer for the Fora trip curated by
        <a href="mailto:${escapeHtml(trip.curator.email)}">${escapeHtml(trip.curator.name)}</a>.
        Booking confirmations stay on Fora.
      </p>
      <p class="travelers">${trip.travelers.map(escapeHtml).join(' · ')}</p>
    </footer>
  `

  bindEvents()
  syncUrl()
  scrollActiveChipIntoView()
}

function syncUrl() {
  const day = days[selectedIndex]
  const url = new URL(window.location.href)
  url.searchParams.set('day', day.id)
  window.history.replaceState({}, '', url)
}

function scrollActiveChipIntoView() {
  const active = document.querySelector('.day-chip.is-active')
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
}

function selectDay(index, { scrollToPanel = true } = {}) {
  if (index < 0 || index >= days.length || index === selectedIndex) {
    if (index === selectedIndex && scrollToPanel) {
      document.getElementById('day-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }
  selectedIndex = index
  renderApp()
  if (scrollToPanel) {
    requestAnimationFrame(() => {
      document.getElementById('day-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

function bindEvents() {
  document.querySelectorAll('[data-select]').forEach((el) => {
    el.addEventListener('click', () => {
      selectDay(Number(el.getAttribute('data-select')))
    })
  })

  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', () => {
      const value = el.getAttribute('data-goto')
      if (value === '') return
      selectDay(Number(value))
    })
  })
}

window.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    selectDay(selectedIndex - 1)
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    selectDay(selectedIndex + 1)
  }
})

renderApp()