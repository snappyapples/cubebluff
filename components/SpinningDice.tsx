export default function SpinningDice() {
  // Dot configurations for each face value
  const dotConfigs: { [key: number]: string[] } = {
    1: ['col-start-2 row-start-2'],
    2: ['col-start-3 row-start-1', 'col-start-1 row-start-3'],
    3: ['col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3'],
    4: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-3', 'col-start-3 row-start-3'],
    5: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'],
    6: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-2', 'col-start-3 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'],
  }

  const renderFace = (value: number) => (
    <div className="spinning-dice-dots">
      {dotConfigs[value].map((pos, idx) => (
        <div key={idx} className={`spinning-dice-dot ${pos}`} />
      ))}
    </div>
  )

  const renderDie = (isSecond: boolean = false) => (
    <div className={`spinning-dice-container ${isSecond ? 'dice-2' : ''}`}>
      <div className="spinning-dice-face face-1">{renderFace(1)}</div>
      <div className="spinning-dice-face face-2">{renderFace(2)}</div>
      <div className="spinning-dice-face face-3">{renderFace(3)}</div>
      <div className="spinning-dice-face face-4">{renderFace(4)}</div>
      <div className="spinning-dice-face face-5">{renderFace(5)}</div>
      <div className="spinning-dice-face face-6">{renderFace(6)}</div>
    </div>
  )

  return (
    <div className="flex justify-center gap-6" style={{ perspective: '800px' }}>
      {renderDie(false)}
      {renderDie(true)}
    </div>
  )
}
