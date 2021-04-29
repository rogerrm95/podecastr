import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import styles from './styles.module.scss'

import { Head } from 'next/document'
import Link from 'next/link'

export function Header() {

    const date = format(new Date(), 'EEEEEE, d MMM', { locale: ptBR })

    return (
        <header className={styles.headerContainer}>
            <Link href='/'>
                <a>
                    <img src="/logo.svg" alt="podecastr" />
                </a>
            </Link>

            <p>O melhor para você ouvir, sempre</p>

            <span>{date}</span>
        </header>
    )
}