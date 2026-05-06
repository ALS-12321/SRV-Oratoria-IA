import React, { useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js'
import axios from 'axios'

function App() {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const recordRef = useRef(null) // Referencia para controlar la grabación
  const [grabando, setGrabando] = useState(false)

  const manejarGrabacion = async () => {
    if (!grabando) {
      // --- LÓGICA PARA INICIAR ---
      if (wavesurferRef.current) wavesurferRef.current.destroy()

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#4f46e5',
        height: 100,
      })

      const record = ws.registerPlugin(RecordPlugin.create())
      
      try {
        await record.startRecording()
        wavesurferRef.current = ws
        recordRef.current = record
        setGrabando(true)
      } catch (err) {
        alert("Error al acceder al micrófono")
      }
    } else {
      // --- LÓGICA PARA DETENER Y ENVIAR (FLUJO DE TESIS) ---
      setGrabando(false)
      recordRef.current.stopRecording()

      // 1. Obtener el audio grabado
      recordRef.current.on('record-end', async (blob) => {
        const formData = new FormData()
        // Enviamos el archivo como 'file' para que FastAPI lo reciba correctamente
        formData.append('file', blob, 'practica_oratoria.wav')

        try {
          console.log("Enviando audio al servidor en el puerto 8000...")
          const res = await axios.post('http://127.0.0.1:8000/analizar-fluidez', formData)
          alert("Respuesta del Servidor: " + res.data.mensaje)
        } catch (error) {
          console.error("Error en la conexión:", error)
          alert("No se pudo conectar con el Backend. ¿Está encendido el puerto 8000?")
        }
      })
    }
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>SRV - Sistema de Oratoria</h1>
      <div ref={containerRef} style={{ margin: '20px auto', width: '80%', minHeight: '100px', border: '1px solid #444', borderRadius: '8px' }}></div>
      
      <button 
        onClick={manejarGrabacion} 
        style={{ 
          padding: '15px 30px', 
          fontSize: '18px', 
          cursor: 'pointer', 
          borderRadius: '8px',
          backgroundColor: grabando ? '#ef4444' : '#4f46e5',
          color: 'white',
          border: 'none'
        }}
      >
        {grabando ? '⏹️ Detener y Analizar' : '🚀 Iniciar Práctica'}
      </button>
    </div>
  )
}

export default App