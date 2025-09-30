export async function api(path: string, init: RequestInit = {}){
const token = document.cookie.split('; ').find(c=>c.startsWith('csrf_token='))?.split('=')[1]
const headers = new Headers(init.headers||{})
if(init.method && init.method !== 'GET' && token){ headers.set('X-CSRF', token) }
const res = await fetch(`/api${path}`, { credentials:'include', ...init, headers })
if(!res.ok) throw new Error(await res.text())
const ct = res.headers.get('content-type')||''
return ct.includes('application/json')? res.json() : res.text()
}
