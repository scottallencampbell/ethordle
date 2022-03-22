// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Ethordle {
    uint256 public playerCount = 0;

    struct Player {
        uint256 id;
        uint256 wordCount;
        string[] words;
    }

    mapping(address => Player) public players;
    address[] public playerList;

    function registerSolution(address _player, string memory _word) public {
        if (players[_player].id == 0) {
            playerCount++;
            Player memory player;
            player.id = playerCount;
            players[_player] = player;
        }

        players[_player].wordCount++;
        players[_player].words.push(_word);        
    }

    function getWord(address _player, uint256 index) public view returns (string memory word) {
        if (players[_player].id == 0) {
            word = "";
        } else {
            word = players[_player].words[index];
        }
    }
}
