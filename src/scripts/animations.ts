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

  const rise = (el: HTMLElement, delay: number) => {
    gsap.set(el, { opacity: 1 })
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
          delay,
          onComplete: () => self.revert(),
        })
      },
    })
  }

  rise(heading, 0.1)
  rise(name, 0.3)

  gsap.fromTo(
    contacts,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      delay: 0.8,
    },
  )
})

// Scroll reveals
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    })
  })
})
