import type { TimelineEntry as TimelineEntryData } from '@/content/types'
import * as motion from 'motion/react-m'
import { useTextEntrance } from '@/lib/motion'

interface TimelineEntryProps {
  entry: TimelineEntryData
}

/** Company or qualification with its dates, followed by the role or school. */
export function TimelineEntry({ entry }: TimelineEntryProps) {
  const entrance = useTextEntrance()
  return (
    <motion.article {...entrance.group} className="timeline-entry flex flex-col">
      <motion.div {...entrance.item} className="entry-heading flex items-baseline">
        <h3 className="m-0">{entry.title}</h3>
        <span className="entry-period whitespace-nowrap">{entry.period}</span>
      </motion.div>

      <motion.p {...entrance.item} className="entry-subtitle m-0 text-ink-soft">
        {entry.subtitle}
      </motion.p>
    </motion.article>
  )
}
