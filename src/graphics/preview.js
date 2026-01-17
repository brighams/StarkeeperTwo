import { identity_matrix } from './math.js'
import { clear_screen, draw_spark, init_renderer } from './renderer.js'

const canvas = document.getElementById('gameCanvas')
init_renderer(canvas)

export const game_state = {
  game_over: true,
  game_started: false,
  pyrrhic_victory: false,
}

let keys_pressed = {}
let space_pressed = false
let last_time = 0

const reset_game = (new_game = true) => {

}

document.addEventListener('keydown', (e) => {
  keys_pressed[e.key] = true

  if (e.key === ' ') {
    if (!game_state.game_over && !game_state.round_won && !space_pressed && player.alive && player_bullets.length < 3) {
      space_pressed = true
    }
  }

  if (e.key === 'Enter') {
    if (game_state.game_over) {
      reset_game(true)
    } else if (game_state.round_won) {
      reset_game(false)
    }
  }
})

document.addEventListener('keyup', (e) => {
  keys_pressed[e.key] = false

  if (e.key === ' ') {
    space_pressed = false
  }
})

const game_loop = (current_time) => {
  const dt = (current_time - last_time) / 1000
  last_time = current_time

  clear_screen()

  const transform = identity_matrix()

  draw_ui(game_state)
  requestAnimationFrame(game_loop)
}

init_ring_faces()
requestAnimationFrame(game_loop)
