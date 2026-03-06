import React from "react";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5"; // Fix 1
import { TbArrowsShuffle } from "react-icons/tb";
import { RiLoopRightLine } from "react-icons/ri";
import "../../css/footer/Feature.css";

const Features = ({ playerState, playerFeatures }) => {
  const { isMuted, loopEnabled, shuffleEnabled, playbackSpeed, volume } = playerState;
  const {
    onToggleMute,
    onToggleLoop,
    onToggleShuffle,
    onChangeSpeed,
    onChangeVolume,
  } = playerFeatures;

  const handleChangeSpeed = (e) => {
    onChangeSpeed(Number(e.target.value));
  };

  const handleVolumeChange = (e) => {
    const value = Number(e.target.value);
    onChangeVolume(value / 100);
  };

  const volPercent = (volume || 0) * 100;

  return (
    <div className="features-root">
      <div className="features-row">
        <button className="features-btn" onClick={onToggleMute}>
          {isMuted ? (
            <IoVolumeMuteOutline color="#a855f7" size={26} />
          ) : (
            <IoVolumeHighOutline color="#a855f7" size={26} />
          )}
        </button>

        <button 
          className={shuffleEnabled ? "features-btn features-btn-active" : "features-btn"} 
          onClick={onToggleShuffle}
        >
          <TbArrowsShuffle color={shuffleEnabled ? "#a855f7" : "#9ca3af"} size={26} />
        </button>

        <button 
          className={loopEnabled ? "features-btn features-btn-active" : "features-btn"} 
          onClick={onToggleLoop}
        >
          <RiLoopRightLine color={loopEnabled ? "#a855f7" : "#9ca3af"} size={26} />
        </button>

        <select
          className="features-speed-select"
          value={playbackSpeed}
          onChange={handleChangeSpeed} // Removed readOnly
        >
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>

      <div className="features-volume-wrapper">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volPercent)}
          onChange={handleVolumeChange} // Removed readOnly
          className="features-volume-range"
          style={{
            background: `linear-gradient(to right, #a855f7 ${volPercent}%, #333 ${volPercent}%)`,
          }}
        />
      </div>
    </div>
  );
};

export default Features;