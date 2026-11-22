import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const mm = gsap.matchMedia()

// Hero intro
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const heading = document.querySelector<HTMLElement>('[data-hero-heading]')
  const name = document.querySelector<HTMLElement>('[data-hero-name]')
  const contacts = gsap.utils.toArray<HTMLElement>('[data-hero-contact]')

  if (!heading || !name) return

  let eyebrowTl: gsap.core.Timeline | null = null
  let nameDone = false
  let played = false

  // Plays once, when both the name has finished and the eyebrow timeline is built
  const maybePlay = () => {
    if (played || !nameDone || !eyebrowTl) return
    played = true
    eyebrowTl.play()
  }

  // Name: one letter at a time
  SplitText.create(name, {
    type: 'words, chars',
    autoSplit: true,
    onSplit(self) {
      gsap.set(name, { opacity: 1 })
      const last = self.chars.length - 1

      return gsap.from(self.chars, {
        opacity: 0,
        y: -100,
        scale: 1.5,
        rotate: (i: number) => (last ? (i / last - 0.5) * 8 : 0),
        transformOrigin: 'center bottom',
        duration: 1,
        ease: 'power2.out',
        stagger: 0.05,
        delay: 0.25,
        onComplete: () => {
          self.revert()
          nameDone = true
          maybePlay()
        },
      })
    },
  })

  // Eyebrow: each phrase drops, hits the top of the name, squashes, rebounds into place
  document.fonts.ready.then(() => {
    const phrases = gsap.utils.toArray<HTMLElement>('[data-phrase]', heading)

    const nameTop = name.getBoundingClientRect().top
    const nameSize = parseFloat(getComputedStyle(name).fontSize)
    const capGap = nameSize * 0.3 // distance from the name's line box to the top of its capitals

    gsap.set(heading, { opacity: 1 })
    gsap.set(phrases, { transformOrigin: 'center bottom' })

    const FALL = 0.35 // seconds to fall
    const GAP = 0.3 // seconds between one phrase and the next

    const tl = gsap.timeline({ paused: true })

    phrases.forEach((phrase, i) => {
      const rect = phrase.getBoundingClientRect()
      const landY = nameTop - rect.bottom + capGap // how far below its resting spot the phrase touches the name
      const startY = -(rect.bottom + 40) // just above the top of the viewport
      const t = i * GAP
      const hit = t + FALL // the moment of impact

      tl
        // fall (accelerating)
        .fromTo(
          phrase,
          { opacity: 0, y: startY },
          { opacity: 1, y: landY, duration: FALL, ease: 'power2.in' },
          t,
        )
        // impact squash
        .to(
          phrase,
          { scaleY: 0.7, scaleX: 1.12, duration: 0.07, ease: 'power1.out' },
          hit,
        )
        // rebound up into position
        .to(phrase, { y: 0, duration: 1, ease: 'power2.out' }, hit + 0.07)
        .to(
          phrase,
          { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' },
          hit + 0.07,
        )
    })

    // Contact row once the last phrase is rebounding
    tl.fromTo(
      contacts,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 },
      '-=0.6',
    )

    eyebrowTl = tl
    maybePlay()
  })
})

// Scroll reveals
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      },
    )
  })
})

// Testimonials: pinned section, cards slide in from the right and stack
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const section = document.querySelector<HTMLElement>('[data-testimonials]')
  const stage = section?.querySelector<HTMLElement>('[data-testimonial-stage]')
  const cards = gsap.utils.toArray<HTMLElement>(
    '[data-testimonial-card]',
    section,
  )

  if (!section || !stage || !cards.length) return

  // Take the cards out of the flow so they can sit on top of each other
  gsap.set(cards, { position: 'absolute', top: 0, left: 0 })

  // The stage needs an explicit height now that nothing inside it takes up space,
  // and every card is set to the height of the tallest one
  const sizeStage = () => {
    gsap.set(cards, { height: 'auto' }) // clear any earlier height so we measure the natural size
    const tallest = Math.max(...cards.map((c) => c.offsetHeight))
    gsap.set(cards, { height: tallest })
    gsap.set(stage, { height: tallest + 48 })
  }
  sizeStage()
  ScrollTrigger.addEventListener('refreshInit', sizeStage)

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${cards.length * 600}`,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })

  cards.forEach((card, i) => {
    const dir = i % 2 === 0 ? 6 : -6 // alternate which way each card tilts
    const rest = i % 2 === 0 ? i * 1.5 : i * -1.5 // final resting tilt grows down the stack
    const t = i * 0.6

    gsap.set(card, { zIndex: i + 1 })

    tl.fromTo(
      card,
      { x: () => window.innerWidth, y: 0, rotate: dir * 1.2 },
      { x: i * 6, y: i * 4, rotate: rest, ease: 'power3.out', duration: 0.6 },
      t,
    )
      // settling wobble
      .to(
        card,
        { rotate: rest + dir * 0.3, duration: 0.08, ease: 'power1.inOut' },
        t + 0.6,
      )
      .to(
        card,
        { rotate: rest - dir * 0.2, duration: 0.08, ease: 'power1.inOut' },
        t + 0.68,
      )
      .to(
        card,
        { rotate: rest, duration: 0.07, ease: 'power1.inOut' },
        t + 0.76,
      )
  })

  // Hold the finished stack for a moment before the section unpins
  tl.to({}, { duration: 0.6 })

  return () => ScrollTrigger.removeEventListener('refreshInit', sizeStage)
})

// Heights depend on the web fonts, so recalculate once they've loaded
document.fonts.ready.then(() => ScrollTrigger.refresh())

// Background blur: blurred from Summary onwards
const bg = document.querySelector<HTMLElement>('[data-bg]')
const summary = document.querySelector<HTMLElement>('#summary')

if (bg && summary) {
  ScrollTrigger.create({
    trigger: summary,
    start: 'top 80%',
    end: 'max',
    onToggle: (self) => bg.toggleAttribute('data-blurred', self.isActive),
  })
}
