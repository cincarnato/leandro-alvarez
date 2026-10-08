import { nextTick, onUnmounted, ref } from 'vue'
import { parseCouponToken } from '../providers/BenefitsApi'

type Detector = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> }
type DetectorConstructor = { new(options: { formats: string[] }): Detector; getSupportedFormats?: () => Promise<string[]> }

export function useCouponScanner(onToken: (token: string) => void) {
  const video = ref<HTMLVideoElement | null>(null)
  const scanning = ref(false)
  const starting = ref(false)
  const cameraError = ref('')
  let stream: MediaStream | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let generation = 0
  let disposed = false
  const DetectorClass = (window as Window & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector
  const supported = !!DetectorClass && !!navigator.mediaDevices?.getUserMedia

  function stop() {
    generation++
    clearTimeout(timer)
    stream?.getTracks().forEach(track => track.stop())
    stream = null
    if (video.value) video.value.srcObject = null
    scanning.value = false; starting.value = false
  }
  async function start() {
    stop(); cameraError.value = ''
    if (!supported || !DetectorClass) { cameraError.value = 'benefitsMvp.cameraUnavailable'; return }
    const current = generation
    starting.value = true
    try {
      const formats = await DetectorClass.getSupportedFormats?.()
      if (formats && !formats.includes('qr_code')) throw new Error('QR unavailable')
      if (disposed || current !== generation) return
      const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      if (disposed || current !== generation) { acquired.getTracks().forEach(track => track.stop()); return }
      stream = acquired; scanning.value = true
      await nextTick()
      if (!video.value || current !== generation) return
      video.value.srcObject = stream
      await video.value.play()
      const detector = new DetectorClass({ formats: ['qr_code'] })
      async function detect() {
        if (disposed || current !== generation || !video.value) return
        try {
          if (video.value.readyState >= 2) {
            const results = await detector.detect(video.value)
            if (disposed || current !== generation) return
            for (const result of results) {
              const token = parseCouponToken(result.rawValue)
              if (token) { stop(); onToken(token); return }
            }
          }
          timer = setTimeout(detect, 300)
        } catch { if (current === generation) { stop(); cameraError.value = 'benefitsMvp.cameraError' } }
      }
      void detect()
    } catch { if (current === generation) { stop(); cameraError.value = 'benefitsMvp.cameraError' } }
    finally { if (current === generation) starting.value = false }
  }
  function visibilityChanged() { if (document.hidden) stop() }
  document.addEventListener('visibilitychange', visibilityChanged)
  onUnmounted(() => { disposed = true; stop(); document.removeEventListener('visibilitychange', visibilityChanged) })
  return { video, scanning, starting, supported, cameraError, start, stop }
}
