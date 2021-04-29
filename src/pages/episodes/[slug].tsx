import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'

import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { convertSecondToHours } from '../../utils/convertSecondToHours' // Utils //
import api from '../../services/api' // API //
import styles from './episode.module.scss' // CSS //
import { usePlayer } from '../../contexts/PlayerContext' // Contexto //

type Episode = {
    id: string,
    title: string,
    members: string,
    publishedAt: string,
    thumbnail: string,
    url: string,
    duration: number,
    durationInString: string,
    description: string
}

type EpisodeProps = {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {

    const { play } = usePlayer()
    return (
        <div className={styles.episode}>

            <Head>
                <title>{episode.title} | Podecastr</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href='/'>
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>

                <Image src={episode.thumbnail} width={700} height={160} objectFit='cover' />

                <button type='button' onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationInString}</span>
            </header>

            <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: episode.description }}
            />

        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('/episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {

    // const router = useRouter() // HOOKS SÓ PODEM SER USADOS DENTRO DE COMPONENTES //
    const { slug } = ctx.params
    const { data } = await api.get(`episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        thumbnail: data.thumbnail,
        url: data.file.url,
        duration: data.file.duration,
        durationInString: convertSecondToHours(data.file.duration),
        description: data.description
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 12 // 12 Horas
    }
}