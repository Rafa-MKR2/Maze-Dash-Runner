// MapParser - converte mapas textuais em arrays numéricos.
// Responsabilidade exclusiva: ler caracteres, converter para números,
// validar estrutura. Não conhece regras de gameplay, Director,
// goblins, chave ou porta.
// Suporta modo híbrido: se receber array numérico, retorna como está.
var MapParser = {

    // tabela de conversao caractere → tile
    // # = parede, . = chao, S = spawn do jogador, C = candidata a moeda
    CHAR_MAP: {
        '#': 1,
        '.': 0,
        'S': 2,
        'C': 3
    },

    // converte um maze textual ou numerico para array numerico interno.
    // retorna { maze, playerSpawn } ou lanca erro se invalido.
    parse: function(maze){
        // modo hibrido: se ja e numerico, retorna direto
        if(Array.isArray(maze) && Array.isArray(maze[0])){
            // ja esta no formato interno — retorna sem alteracoes
            return { maze: maze, playerSpawn: null };
        }

        // valida que e array de strings
        if(!Array.isArray(maze) || typeof maze[0] !== 'string'){
            throw new Error('MapParser: formato de maze invalido');
        }

        var rows = maze.length;
        var cols = maze[0].length;
        var result = [];
        var playerSpawn = null;

        for(var r = 0; r < rows; r++){
            var line = maze[r];
            if(line.length !== cols){
                throw new Error('MapParser: linha ' + (r + 1) + ' tem ' + line.length + ' caracteres (esperado ' + cols + ')');
            }

            var row = [];
            for(var c = 0; c < line.length; c++){
                var ch = line[c];
                var tile = this.CHAR_MAP[ch];

                if(tile === undefined){
                    throw new Error('MapParser: caractere invalido "' + ch + '" na linha ' + (r + 1) + ', coluna ' + (c + 1));
                }

                if(tile === 2){
                    if(playerSpawn !== null){
                        throw new Error('MapParser: multiplos spawns (S) encontrados');
                    }
                    playerSpawn = { row: r, col: c };
                }

                row.push(tile);
            }
            result.push(row);
        }

        if(playerSpawn === null){
            throw new Error('MapParser: nenhum spawn (S) encontrado');
        }

        return { maze: result, playerSpawn: playerSpawn };
    }

};
