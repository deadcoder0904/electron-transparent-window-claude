function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
    console.log('Transparent overlay initialized')

    // Example: Make certain elements interactive
    const content = document.querySelector('.overlay-content')
    if (content) {
      content.addEventListener('mouseenter', () => {
        // Tell the main process to enable mouse events for this region
        window.electron.ipcRenderer.send('set-ignore-mouse-events', false)
      })

      content.addEventListener('mouseleave', () => {
        // Tell the main process to disable mouse events again
        window.electron.ipcRenderer.send('set-ignore-mouse-events', true)
      })
    }
  })
}

init()
