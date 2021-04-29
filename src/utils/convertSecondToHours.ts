export function convertSecondToHours(time: number) {
    
    const hour = Math.floor(time / 3600)
    const minute = Math.floor((time % 3600) / 60)
    const second = time % 60

    const finalResult = [hour, minute, second].map(time => {
        return String(time).padStart(2, '0')
    }).join(':')

    return finalResult
}