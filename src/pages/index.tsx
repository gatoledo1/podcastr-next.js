// SPA - chamadas fetch no useEffect
// SSR - Criar uma async function chamada getServerSideProps, com um fetch da API e retornando uma props
// SSG - Criar uma async function chamada getStaticProps, com um fetch da API e retornando uma props

import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { api } from '../services/api';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';

import styles from './home.module.scss';

interface Episodes {
  slug: string,
  title: string,
  members: string,
  publishedAt: string,
  thumbnail: string,
  description: string,
  durationAsString: string,
  url: string,
  duration: number,
}

interface HomeProps {
  latestEpisodes: Array<Episodes>
  allEpisodes: Array<Episodes>
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { playList } = useContext(PlayerContext);
  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>

      <Head>
        <title>Home | Podcastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {
            latestEpisodes.map((episode, index) => {
              return (
                <li key={episode.slug}>
                  <div style={{ width: '6rem' }}>
                    <Image
                      src={episode.thumbnail}
                      alt={episode.title}
                      width={192}
                      height={192}
                      objectFit="cover"
                    />
                  </div>

                  <div className={styles.episodeDetails}>
                    <Link href={`/episodes/${episode.slug}`}>
                      <a>{episode.title}</a>
                    </Link>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button" onClick={() => playList(episodeList, index)}>
                    <img src="/play-green.svg" alt="Tocar episodio" />
                  </button>
                </li>
              )
            })
          }
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.slug}>
                    <td style={{ width: 72 }}>
                      <Image
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.slug}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}> {/* Primeiro index do episodeList começa apos o termino do latestEpisodes */}
                        <img src="/play-green.svg" alt="Tocar episodio" />
                      </button>
                    </td>
                  </tr>

                )
              })
            }
          </tbody>
        </table>
      </section>
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      //_order: 'desc'
    }
  })

  const data = response.data

  const episodes = data.map(episode => {
    return {
      slug: episode.slug,
      title: episode.title,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      thumbnail: episode.thumbnail,
      description: episode.description,
      url: episode.file.url,
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration))
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 20 * 1, // gera nova requisição a cada 20min 
  }
}

// Server Side Rendering - SSR
/*export async function getServerSideProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data,
    }
  }
}*/
