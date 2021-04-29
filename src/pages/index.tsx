import { GetServerSideProps, GetStaticProps } from 'next'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import api from '../services/api' // API //
import { convertSecondToHours } from '../utils/convertSecondToHours' // UTILS //
import styles from './home.module.scss' // CSS //

import { usePlayer } from '../contexts/PlayerContext' // Contexto //


type Episode = {
  id: string,
  title: string,
  members: string,
  publishedAt: string,
  thumbnail: string,
  url: string,
  duration: number,
  durationInString: string
}

interface HomeProps {
  allEpisodes: Episode[]
  latestEpisodes: Episode[]
}

export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {

  const { playList } = usePlayer()

  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (

    <div className={styles.homeContainer}>

      <Head>
        <title>Home | Podecastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Ultimos Lançamentos</h2>

        <ul>
          {
            latestEpisodes.map((episode, index) => (
              <li key={episode.id}>
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  width={288}
                  height={288}
                  objectFit='cover'
                />

                <div className={styles.episodeDetails}>
                  <Link href={`episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationInString}</span>
                </div>

                <button type='button'>
                  <img
                    src='/play-green.svg'
                    alt="Ouvir episódio"
                    onClick={() => playList(episodeList, index)}
                  />
                </button>
              </li>
            ))
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
              <th>Tocar</th>
            </tr>
          </thead>

          <tbody>
            {

              allEpisodes.map((episode, index) => (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit='cover'
                    />
                  </td>
                  <td>
                    <Link href={`episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 76 }}>{episode.publishedAt}</td>
                  <td>{episode.durationInString}</td>
                  <td>
                    <button
                      type='button'
                      onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar" />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>
    </div>
  )
}

// getServerSideProps: GetServerSideProps
// SSG só funciona em modo de produção //
export async function getStaticProps() {
  const { data } = await api.get('/episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  // Data Fetching //
  const episodes = data.map((episode) => (
    {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      thumbnail: episode.thumbnail,
      url: episode.file.url,
      duration: episode.file.duration,
      durationInString: convertSecondToHours(episode.file.duration)
    }
  ))

  const latestEpisodes = episodes.slice(0, 2)
  const allEpisodes = episodes.slice(2, episodes.length)

  return {
    props: {
      allEpisodes,
      latestEpisodes
    },
    revalidate: 60 * 60 * 8 // 8hr
  }
}