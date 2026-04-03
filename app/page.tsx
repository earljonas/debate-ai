'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'

export default function Home() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 pt-14">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 mb-8">
                <span className="text-sm font-bold tracking-wider text-pro">RED CORNER</span>
                <span className="relative">
                  <span className="text-2xl font-black text-muted-foreground/30 animate-float">
                    VS
                  </span>
                </span>
                <span className="text-sm font-bold tracking-wider text-con">BLUE CORNER</span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-4 text-gradient-hero">
                AI Debate Arena
              </h1>

              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Two AI agents argue any topic. Watch the arguments unfold in real-time, then see the verdict.
              </p>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter the Arena
              </Link>
            </div>

            <div
              className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              {[
                { label: 'Pick a Topic', desc: 'Choose any debate topic' },
                { label: 'Watch Live', desc: 'AI agents argue in rounds' },
                { label: 'Get a Verdict', desc: 'A judge AI decides the winner' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-xl p-4 text-center"
                >
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}