//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BallotImproved {

    struct vote{
        address voterAddress;
        bytes32 choice;
    }
    
    struct voter{
        string voterName;
        bool voted;
    }

    uint private countResult = 0;
    uint public finalResult = 0;
    uint public totalVoter = 0;
    uint public totalVote = 0;
    address public ballotOfficialAddress;      
    string public ballotOfficialName;
    string public proposal;
    uint public optionsLength = 0;

    uint[] public finalResults;
    string[] public options;
    mapping(bytes32 => uint) private countResults; 
    mapping(uint => vote) private votes;
    mapping(address => voter) public voterRegister;
    
    enum State { Created, Voting, Ended }
	State public state;
	
	//creates a new ballot contract
	constructor(
        string memory _ballotOfficialName,
        string memory _proposal,
        string[] memory _choices,
        bytes32[] memory _encryptedChoices
        ) {
        ballotOfficialAddress = msg.sender;
        ballotOfficialName = _ballotOfficialName;
        proposal = _proposal;

        optionsLength = _choices.length;

        for(uint i = 0; i < _encryptedChoices.length; i++) {
            countResults[_encryptedChoices[i]] = 0;
            options.push(_choices[i]);
        }
        
        state = State.Created;
    }
    
    
	modifier condition(bool _condition) {
		require(_condition);
		_;
	}

	modifier onlyOfficial() {
		require(msg.sender ==ballotOfficialAddress);
		_;
	}

	modifier inState(State _state) {
		require(state == _state);
		_;
	}

    event voterAdded(address voter);
    event voteStarted();
    event voteEnded(uint[] finalResults);
    event voteDone(address voter);
    event wrongHash();

    function hash(string memory _string) public pure returns(bytes32) {
        return keccak256(abi.encode(_string));
    }

    function append(string memory a, string memory b) internal pure returns (string memory) {

        return string(abi.encodePacked(a, b));
    }

    //add voter
    function addVoter(address _voterAddress, string memory _voterName)
        public
        inState(State.Created)
        onlyOfficial
    {
        voter memory v;
        v.voterName = _voterName;
        v.voted = false;
        // Check if the voter already exists when adding
        if(bytes(voterRegister[_voterAddress].voterName).length == 0) {
            totalVoter++;
        }
        voterRegister[_voterAddress] = v;
        emit voterAdded(_voterAddress);
    }

    //declare voting starts now
    function startVote()
        public
        inState(State.Created)
        onlyOfficial
    {
        state = State.Voting;     
        emit voteStarted();
    }

    //voters vote by indicating their choice (true/false)
    function doVote(bytes32 _choice)
        public
        inState(State.Voting)
        returns (bool voted)
    {
        bool found = false;
        
        if (bytes(voterRegister[msg.sender].voterName).length != 0 
        && !voterRegister[msg.sender].voted){
            
            voterRegister[msg.sender].voted = true;
            vote memory v;
            v.voterAddress = msg.sender;
            v.choice = _choice;

            countResults[_choice]++;
            votes[totalVote] = v;
            totalVote++;
            found = true;
        }
        emit voteDone(msg.sender);
        return found;
    }
    
    //end votes
    function endVote(string memory _password1, string memory _password2)
        public
        inState(State.Voting)
        onlyOfficial
    {
        uint count = 0;
        for(uint i = 0; i < options.length; i++) {
            bytes32 optionHash = hash(append(append(_password1, options[i]), _password2));
            finalResults.push(countResults[optionHash]);
            // finalResults[_choices[i]] = 0;
            // uint value = hash(_password1 . i . _password2);
            // options.push(_choices[i]);
            if(countResults[optionHash] != 0) {
                count++;
            }
        }
        if(count == 0) {
            delete finalResults;
            emit wrongHash();
        } else {
            state = State.Ended;
            emit voteEnded(finalResults);
        }
        // countResults[_electionCommit] = 0;
        // for(uint i = 0; i < _options.length; i++) {
        //     countResults[_options[i]] = 0;
        // }
        // finalResult = countResult; //move result from private countResult to public finalResult
    }
}