const OPGG_REGION: Record<string, string> = {
    euw1: 'euw',
    eun1: 'eune',
    na1: 'na',
    kr: 'kr',
    jp1: 'jp',
    oc1: 'oce',
    br1: 'br',
    la1: 'lan',
    la2: 'las',
    ru: 'ru',
    tr1: 'tr'
}

export function opggProfile(region: string, name: string) {
    const r = OPGG_REGION[region.toLowerCase()] || region.toLowerCase()
    const enc = encodeURIComponent(name)
    return `https://www.op.gg/summoners/${r}/${enc}`
}

export function uggProfile(region: string, name: string) {
    const enc = encodeURIComponent(name)
    return `https://u.gg/lol/profile/${region.toLowerCase()}/${enc}/overview`
}

export function ddragonChampionIcon(ver: string, imageFull: string) {
    return `https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${imageFull}`
}

export function ddragonSplash(id: string) {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`
}