import React from 'react'

export default function RightPanel() {
	return (
		<div
			id='right'
			className="relative flex-1 p-6 box-border bg-panel [backdrop-filter:blur(var(--section-blur))_saturate(1.05)] before:content-[''] before:absolute before:inset-0 before:[border-top:1px_solid_rgba(255,255,255,0.06)] before:[border-bottom:1px_solid_rgba(255,255,255,0.04)] before:shadow-[inset_0_0_0_1px_rgba(122,92,255,0.12)] before:pointer-events-none"
		>
			<h2 className="inline-flex items-center gap-2 m-0 mb-3 text-[14px] font-bold uppercase tracking-[0.12em] text-muted after:content-[''] after:inline-block after:w-[66px] after:h-px after:bg-[linear-gradient(90deg,transparent,var(--glow),transparent)] after:[filter:drop-shadow(0_0_3px_rgba(0,255,209,0.5))]">
				RIGHT
			</h2>
			<pre className='m-0 px-4 py-[14px] rounded-[10px] text-code-fg overflow-x-auto relative border border-[--color-code-border] shadow-[var(--shadow-code)] bg-[var(--gradient-code)]'>
        <code className="font-mono text-[12.5px] leading-[1.55]">
          {`// Two Sum — TypeScript
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
console.log(twoSum([2,7,11,15], 9)) // [0,1]`}
        </code>
			</pre>
		</div>
	)
}
