import { useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import Image from 'next/image';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [downPlayer, setDownPlayer] = useState(false);

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        hasPrevious,
        hasNext,
        clearPlayerState
    } = useContext(PlayerContext);

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext()
        } else {
            clearPlayerState()
        }
    }

    const episode = episodeList[currentEpisodeIndex];

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }

    function toggleDownPlayer() {
        downPlayer ? setDownPlayer(false) : setDownPlayer(true);
    }

    return (
        <div className={styles.playerContainer}>
            <header className={episode ? styles.logoPlayingNowRun : styles.logoPlayingNowEmpty}>
                <img src="/playing.svg" alt="tocando agora" />
                <strong>Tocando agora</strong>
            </header>
            <button type="button" className={styles.downButton}>
                <input type="checkbox" className={styles.checkbox} onChange={toggleDownPlayer} />
                <img src="/arrow-down.svg" alt="recolher player" width="20px" className={downPlayer ? styles.rotate : styles.restore} />
            </button>

            { episode ? (
                <div className={!downPlayer ? styles.currentEpisode : styles.toggleNone}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong className={!downPlayer ? '' : styles.toggleNone}>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={!downPlayer ? styles.emptyPlayer : styles.toggleNone}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={!downPlayer ? styles.progress : styles.toggleNone}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {
                            episode ? (
                                <Slider
                                    max={episode.duration}
                                    value={progress}
                                    onChange={handleSeek}
                                    trackStyle={{ backgroundColor: '#04d361' }}
                                    railStyle={{ backgroundColor: '#9f75ff' }}
                                    handleStyle={{ backgroundColor: '#04d361' }}
                                />
                            ) : (
                                <div className={styles.emptySlider} />
                            )
                        }

                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                        src={episode.url}
                        ref={audioRef}
                        loop={isLooping}
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />

                )} {/* NLW05 - aula 04 - 00:55:40 */}

                <div className={styles.buttons}>
                    <button
                        type="button"
                        onClick={toggleShuffle}
                        disabled={!episode || episodeList.length == 1}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar" />
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" />
                    </button>
                    <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
                        {
                            isPlaying
                                ? <img src="/pause.svg" alt="Pausar" />
                                : <img src="/play.svg" alt="Tocar" />
                        }
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" />
                    </button>
                    <button
                        type="button"
                        onClick={toggleLoop}
                        disabled={!episode}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>
                </div>
            </footer>
        </div>
    );
}