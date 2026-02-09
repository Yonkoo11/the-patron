import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { FontLoader } from "./design/fonts";
import { MeshBackground } from "./components/MeshBackground";
import { TitleScene } from "./scenes/01-TitleScene";
import { ProblemScene } from "./scenes/02-ProblemScene";
import { PipelineScene } from "./scenes/03-PipelineScene";
import { DashboardScene } from "./scenes/04-DashboardScene";
import { ResultsScene } from "./scenes/05-ResultsScene";
import { VerificationScene } from "./scenes/06-VerificationScene";
import { CTAScene } from "./scenes/07-CTAScene";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <FontLoader />
      <MeshBackground />
      <Audio src={staticFile("audio/ambient-track.mp3")} volume={0.3} />

      <Sequence from={0} durationInFrames={179}>
        <TitleScene />
      </Sequence>
      <Sequence from={150} durationInFrames={270}>
        <ProblemScene />
      </Sequence>
      <Sequence from={420} durationInFrames={420}>
        <PipelineScene />
      </Sequence>
      <Sequence from={840} durationInFrames={360}>
        <DashboardScene />
      </Sequence>
      <Sequence from={1200} durationInFrames={360}>
        <ResultsScene />
      </Sequence>
      <Sequence from={1560} durationInFrames={300}>
        <VerificationScene />
      </Sequence>
      <Sequence from={1860} durationInFrames={240}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
