export const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

export const createOscillator = (type, frequency, startTime, duration, gainNode) => {
  const osc = audioCtx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)
  osc.connect(gainNode)
  osc.start(startTime)
  osc.stop(startTime + duration)
  return osc
}

export const createGain = (volume, startTime) => {
  const gainNode = audioCtx.createGain()
  gainNode.gain.setValueAtTime(volume, startTime)
  gainNode.connect(audioCtx.destination)
  return gainNode
}
