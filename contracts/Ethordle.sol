// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Ethordle {
    uint256 public playerCount = 0;
    uint256 public wordCount = 0;

    struct Player {
        uint256 id;
        uint256 wordCount;
        string[] words;
    }

    mapping(address => Player) public players;
    mapping(string => Player) public words;

    address[] public playerList;

    function registerWord(address _player, string memory _word) public {
        require(words[_word].id == 0, 'This word has already been registered');

        if (players[_player].id == 0) {
            playerCount++;
            Player memory player;
            player.id = playerCount;
            players[_player] = player;
        }

        wordCount++;
        players[_player].wordCount++;
        players[_player].words.push(_word);
        words[_word] = players[_player];     
    }

    function getWord(address _player, uint256 _index) public view returns (string memory word) {
        require(players[_player].id != 0, 'Player address does not exist');

        word = players[_player].words[_index];
    }

    function isWordUnique(string memory _word) public view returns (bool isUnique) {
        isUnique = words[_word].id == 0;
    }
}
