export default function IntroSection() {
  return (
    <fieldset className="groupbox">
      <legend>Sobre esta ferramenta</legend>
      <div className="sunken p-3 bg-white">
        <p className="text-[11px] leading-relaxed mb-3">
          Este monitor consome dados públicos da{" "}
          <a
            href="https://radar.cloudflare.com/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-800 underline"
          >
            Cloudflare Radar
          </a>{" "}
          para mostrar, em tempo quase-real, o panorama de ameaças cibernéticas
          dirigidas a Portugal: quantos ataques de rede e de aplicação estão a
          acontecer, de onde vêm, e quanto do tráfego web português é gerado
          por automação (bots) em vez de pessoas reais. A Cloudflare vê uma
          fatia significativa do tráfego da internet mundial, por isso estes
          números são uma amostra real, não uma simulação.
        </p>
        <p className="text-[11px] font-bold mb-1">Como ler a página:</p>
        <ol className="text-[11px] leading-relaxed list-decimal list-inside space-y-1">
          <li>
            Os três painéis no topo dão o <b>contexto macro</b> dos últimos 7
            dias: tráfego automatizado, adoção de IPv6, e anomalias confirmadas.
          </li>
          <li>
            O <b>ecrã de radar à esquerda</b> responde a "de onde vêm os
            ataques": cada ponto é um país de origem; quanto mais afastado do
            centro e maior o ponto, maior o peso relativo desse país.
          </li>
          <li>
            O <b>gráfico à direita</b> responde a "quando": mostra a
            intensidade dos ataques ao longo do tempo, Layer 3 vs Layer 7.
          </li>
          <li>
            O <b>painel de anomalias</b> em baixo lista eventos já validados
            pela Cloudflare como fora do padrão normal.
          </li>
        </ol>
      </div>
    </fieldset>
  );
}
