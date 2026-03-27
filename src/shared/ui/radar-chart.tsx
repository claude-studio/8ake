import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from 'recharts'

export interface RadarDataPoint {
  axis: string
  value: number
}

interface Props {
  data: RadarDataPoint[]
  size?: number
}

export function RadarChart({ data, size = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{
            fill: 'var(--muted-foreground)',
            fontSize: 12,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
          }}
        />
        <Radar
          dataKey="value"
          fill="var(--primary)"
          fillOpacity={0.25}
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--primary)' }}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}
