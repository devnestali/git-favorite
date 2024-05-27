import { GithubUser } from "./GithubUser.js"

// classe que vai conter a logica dos dados contidos nela
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [] /* talvez possa dar erro neste '/' */
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)
  
      if(userExists) {
        throw new Error ('Usuário já cadastrado')
      }
      
      const user = await GithubUser.search(username)

      if(user.login === undefined){
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }  
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  addNoFavorites() {
    const tbody = this.root.querySelector("tbody")
    const noUserRow = document.createElement("tr")
    noUserRow.className = "tr-empty"
    noUserRow.innerHTML = `
              <td colspan="4">
                <div class="no-user">
                  <img src="/images/star.svg" alt="ícone de uma estrela com uma expressão de surpresa">
                  <span>Nenhum favorito ainda</span>
                </div>
              </td>
            `
    tbody.appendChild(noUserRow)
  }

} 












// classe para criar um novo HTMl e eventos
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('header button')
    
    addButton.onclick = () => {
      const { value } = this.root.querySelector('header input')
      
      this.add(value)
    }
  }

  updateTbodyHeight() {
    const rowCount = this.entries.length
    const rowHeight = 100
    const newHeight = rowCount * rowHeight
    if(this.entries.length === 0){
      this.tbody.style.height = `${rowHeight * 6}px`
    } else {
      this.tbody.style.height = `${newHeight}px`
    }
  }

  update() {
    this.removeAllTr()

    if(this.entries.length === 0){
      this.addNoFavorites()
    }

    this.entries.forEach(user => {
      const row = this.createRow()
      
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = '/' +user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.action').onclick = () => {
        const isOk = confirm('Tem certeza que deseja eliminar esta linha')
      
        if(isOk){
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })

    this.updateTbodyHeight()
  }

  createRow() {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/devnestali.png" alt="Imagem do Usuário">
        <a href="https://github.com/devnestali" target='_blank'>
          <p>Victor Nestali</p>
          <span>devnestali</span>
        </a>
      </td>

      <td class="repositories">
        27
      </td>

      <td class="followers">
        129
      </td>

      <td>
        <button class="action">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove())
  }
}