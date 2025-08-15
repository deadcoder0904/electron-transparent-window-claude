// src/renderer/components/RightPanel.tsx
import React from 'react'
import { PanelSection } from './PanelSection'
import { CodeBlock } from './CodeBlock'

const twoSumCode = `// Two Sum — TypeScript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) {
      return [map.get(complement)!, i]
    }
    map.set(nums[i], i)
  }
  return []
}

// Example:
console.log(twoSum([2,7,11,15], 9)) // [0,1]`

// Right panel content
export default function RightPanel() {
	return (
		<PanelSection id='right' title='RIGHT'>
			<CodeBlock code={twoSumCode} language='TypeScript' />
		</PanelSection>
	)
}
