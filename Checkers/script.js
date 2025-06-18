class Checkers {
    constructor (board) {
        this.board = board

        this.lightPieces = Array.from(board.querySelectorAll('[data-piece="light"]'))
        this.darkPieces = Array.from(board.querySelectorAll('[data-piece="dark"]'))
        this.tiles = Array.from(board.getElementsByClassName('tile'))
        this.isLightTurn = true
        this.pieceClicked = this.pieceClicked.bind(this)
        this.moveHandlers = new Map()
        this.justCaptured = false
    }

    startGame() {
        this.lightPieces.forEach( piece => {
                piece.addEventListener('click', this.pieceClicked)
        })
        this.darkPieces.forEach( piece => {
                piece.addEventListener('click', this.pieceClicked)
        })
    }

    pieceClicked(e) {
        if (!this.justCaptured) {
            this.removeAvailableAttribute()

            const piece = e.target
            let allyPieces = []
            let enemyPieces = []

            if (this.lightPieces.includes(piece) && this.isLightTurn) {
                allyPieces = this.lightPieces
                enemyPieces = this.darkPieces
                this.getAvailableSpaces(piece, allyPieces, enemyPieces)
                this.checkForMove(piece)     
            } 
            if (this.darkPieces.includes(piece) && !this.isLightTurn){
                allyPieces = this.darkPieces
                enemyPieces = this.lightPieces
                this.getAvailableSpaces(piece, allyPieces, enemyPieces)
                this.checkForMove(piece)     
            }
        }
    }

    getAvailableSpaces(piece, allyPieces, enemyPieces) {
        const pieceCol = this.tiles.indexOf(piece) % 8
        const pieceRow = Math.floor(this.tiles.indexOf(piece) / 8)
        const optionCoords = []

        if (this.lightPieces.includes(piece) || piece.hasAttribute('data-crown')) {
            optionCoords.push([(pieceCol + 1), (pieceRow - 1)])
            optionCoords.push([(pieceCol - 1), (pieceRow - 1)])
        } 
        if (this.darkPieces.includes(piece) || piece.hasAttribute('data-crown')){
            optionCoords.push([(pieceCol + 1), (pieceRow + 1)])
            optionCoords.push([(pieceCol - 1), (pieceRow + 1)])
        }

        let i = 0
        while (i < optionCoords.length) {
            const coord = optionCoords[i]
            const tile = this.tiles[8 * (coord[1]) + coord[0]]

            if (coord[0] >= 0 
                && coord[1] >= 0 
                && coord[0] <= 7
                && coord[1] <= 7
                && !allyPieces.includes(tile)
                // && tile !== undefined
                && Math.abs(pieceCol - coord[0]) < 3) {
                    if (enemyPieces.includes(tile)) {
                        if (coord[0] > pieceCol && coord[1] < pieceRow) optionCoords.push([coord[0] + 1, coord[1] - 1])
                        else if (coord[0] < pieceCol && coord[1] < pieceRow) optionCoords.push([coord[0] - 1, coord[1] - 1])
                        else if (coord[0] > pieceCol && coord[1] > pieceRow) optionCoords.push([coord[0] + 1, coord[1] + 1])
                        else if (coord[0] < pieceCol && coord[1] > pieceRow) optionCoords.push([coord[0] - 1, coord[1] + 1])
                    } else if (!this.justCaptured || Math.abs(pieceCol - coord[0]) === 2){
                        tile.setAttribute('data-available', '')
                    }
            }
            i++
        }
    }

    checkForMove(piece) {
        const availableTiles = document.querySelectorAll('[data-available]')

        if (this.justCaptured && availableTiles.length === 0) this.justCaptured = false

        availableTiles.forEach(availableTile => {
            const handler = (e) => {
                this.movePiece(e.target, piece)
                this.checkForCapture(e.target, piece)
                this.moveHandlers.delete(e.target)
             }
             this.moveHandlers.set(availableTile, handler)
             availableTile.addEventListener('click', handler)
        })
    }   

    movePiece(destination, target) {
        this.removeAvailableAttribute()
        
        let side
        let endRow
        let allyPieces = []

        if (this.lightPieces.includes(target)) {
            allyPieces = this.lightPieces
            side = 'light'
            this.isLightTurn = false
            endRow = 0
        } else {
            allyPieces = this.darkPieces
            side = 'dark'
            this.isLightTurn = true
            endRow = 7
        }

        destination.setAttribute('data-piece', side)
        target.removeAttribute('data-piece')
        if (target.hasAttribute('data-crown') || Math.floor(this.tiles.indexOf(destination) / 8) === endRow) {
            destination.setAttribute('data-crown', '')
            target.removeAttribute('data-crown')
        }
        destination.addEventListener('click', this.pieceClicked)
        target.removeEventListener('click', this.pieceClicked) 
        allyPieces[allyPieces.indexOf(target)] = destination
    }

    checkForCapture(destination, target) {
        let destinationCol = this.tiles.indexOf(destination) % 8
        let destinationRow = Math.floor(this.tiles.indexOf(destination) / 8)
        let targetCol = this.tiles.indexOf(target) % 8
        let targetRow = Math.floor(this.tiles.indexOf(target) / 8)
        let capturedPieceCol
        let capturedPieceRow

        if (destinationCol - targetCol === 2) {
            if (destinationRow - targetRow === 2) {
                capturedPieceCol = destinationCol - 1
                capturedPieceRow = destinationRow - 1
                this.capture(destination, this.tiles[8 * capturedPieceRow + capturedPieceCol])
            }
            if (destinationRow - targetRow === -2) {
                capturedPieceCol = destinationCol - 1
                capturedPieceRow = destinationRow + 1
                this.capture(destination, this.tiles[8 * capturedPieceRow + capturedPieceCol])
            }
        }
        if (destinationCol - targetCol === -2) {
            if (destinationRow - targetRow === 2) {
                capturedPieceCol = destinationCol + 1
                capturedPieceRow = destinationRow - 1
                this.capture(destination, this.tiles[8 * capturedPieceRow + capturedPieceCol])
            }
            if (destinationRow - targetRow === -2) {
                capturedPieceCol = destinationCol + 1
                capturedPieceRow = destinationRow + 1
                this.capture(destination, this.tiles[8 * capturedPieceRow + capturedPieceCol])
            }
        }
    }

    capture(piece, capturedPiece) {
        if (this.lightPieces.includes(capturedPiece)) this.lightPieces.splice(this.lightPieces.indexOf(capturedPiece), 1)
        else this.darkPieces.splice(this.darkPieces.indexOf(capturedPiece), 1)
        capturedPiece.removeAttribute('data-piece')
        capturedPiece.removeAttribute('data-crown')
        capturedPiece.removeEventListener('click', this.pieceClicked)

        this.justCaptured = true   
        if (this.lightPieces.includes(piece)) this.getAvailableSpaces(piece, this.lightPieces, this.darkPieces)
        else this.getAvailableSpaces(piece, this.darkPieces, this.lightPieces)
        this.checkForMove(piece)    
    }

    // Create Coord returning Function

    removeAvailableAttribute() {
        this.tiles.forEach(tile => {
            if (tile.hasAttribute('data-available')) {
                tile.removeEventListener('click', this.moveHandlers.get(tile))
                this.moveHandlers.delete(tile)
                tile.removeAttribute('data-available')
            }
        })
    }

}

function ready() {
    let board = document.querySelector('.board')
    const originalBoard = board.cloneNode(true)
    const startButton = document.getElementById('btn-start')

    startButton.addEventListener('click', () => {
        const newBoard = originalBoard.cloneNode(true)
        board.replaceWith(newBoard)
        board = newBoard

        let game = new Checkers(newBoard)

        game.startGame()
        startButton.innerText = 'Restart'
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready())
} else {
    ready()
}
