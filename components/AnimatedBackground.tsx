'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'

/**
 * Função utilitária para criar uma textura de círculo programaticamente.
 * @returns {THREE.Texture} Textura de círculo.
 */
function createCircleTexture() {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    
    if (context) {
        // Círculo branco, que será mapeado para a cor do ponto
        context.beginPath()
        context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        context.fillStyle = 'white' 
        context.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

function Particles() {
    const count = 4000 // Aumentado para 4000
    const radius = 25 // Aumentado para um volume maior
    const points = useRef<THREE.Points>(null)

    // Geração da textura de círculo
    const circleTexture = useMemo(() => createCircleTexture(), [])

    // Criar posições e cores das partículas
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Posições aleatórias em um volume de cubo maior
        positions[i3 + 0] = (Math.random() - 0.5) * radius
        positions[i3 + 1] = (Math.random() - 0.5) * radius
        positions[i3 + 2] = (Math.random() - 0.5) * radius

        // Paleta de Cores GlobalPool: Transição de Roxo Neon (Fúcsia) para Ciano/Verde Neon
        const color = new THREE.Color()
        
        // Mistura controlada: 0.8 é Fúcsia, 0.4 é Ciano-Verde.
        // O matiz (Hue) varia entre Fúcsia e Ciano
        const hue = 0.8 + (Math.random() * 0.6 - 0.3); // Garante que a variação fique perto de 0.8 (fúcsia) e 0.4 (ciano)
        
        // Ajusta o matiz para a faixa correta (0.4 a 0.8)
        let finalHue = hue;
        if (finalHue > 1.0) finalHue -= 1.0; 

        color.setHSL(finalHue, 1, 0.65) // Saturação máxima, leve brilho (0.65)

        colors[i3 + 0] = color.r
        colors[i3 + 1] = color.g
        colors[i3 + 2] = color.b
    }

    // Criar geometria das partículas
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    useFrame(({ }) => {
        if (points.current) {
            // Rotação sutil e contínua
            points.current.rotation.y += 0.0004
            points.current.rotation.x += 0.0001
            
            // Leve movimento ondulatório para dar vida (efeito de Deep Space)
            // points.current.position.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.5;
            // points.current.position.y = Math.cos(clock.getElapsedTime() * 0.03) * 0.5;
        }
    })

    return (
        <points ref={points}>
            <primitive object={particleGeometry} attach="geometry" />
            <pointsMaterial
                size={0.1} // Tamanho aumentado
                vertexColors
                transparent
                opacity={0.65} // Opacidade ajustada para ser sutil
                depthWrite={false}
                blending={THREE.AdditiveBlending} // AditiveBlending é essencial para o efeito neon
                sizeAttenuation
                
                // Aplica a textura de círculo para definir o formato do ponto
                map={circleTexture} 
            />
        </points>
    )
}

export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 65 }}> {/* Posição da câmera recuada e FOV ajustado */}
                {/* Luz ambiente suave para o volume */}
                <ambientLight intensity={0.4} color={0x9999ff} /> 
                
                {/* Partículas neon circulares */}
                <Particles />

                {/* Rotação e movimento de câmera */}
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    autoRotate 
                    autoRotateSpeed={0.1} // Rotação mais lenta
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    )
}