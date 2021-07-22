import { format, parseISO } from 'date-fns';
import ptBR from "date-fns/locale/pt-BR";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useContext } from 'react';
import { Player } from '../../components/Player';
import { PlayerContext } from '../../contexts/PlayerContext';
import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";
import styles from './episode.module.scss'

interface Episode {
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

interface EpisodeProps {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {

    const { play } = useContext(PlayerContext)

    return (
        <div className={styles.episode}>

            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src='/arrow-left.svg' alt="voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src='/play.svg' alt="Tocar episódio" />
                </button>

                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} /> {/*converte o conteudo para HTML*/}

            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => { //NLW05 - aula 4 - 00:07:40 até 00:23:00
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            // _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.slug
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {  //NLW05 - aula 3 - 01:13:40

    const { slug } = ctx.params
    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        slug: data.slug,
        title: data.title,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        thumbnail: data.thumbnail,
        description: data.description,
        url: data.file.url,
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration))
    }


    return {
        props: {
            episode,
        },
        revalidate: 60 * 40 * 1, // gera nova requisição a cada 40min
    }
}