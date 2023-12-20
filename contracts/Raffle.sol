pragma solidity ^0.8.19;
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NftRaffle {
    struct Raffle {
        address raffleOwner;
        uint256 tokenId;
        address nftAddress;
        uint256 ticketPrice;
        uint256 maxTickets;
        address[] ticketOwners;
        uint256 winningTicket;
        uint64 sequenceNumber;
        uint256 entropyFee;
    }

    event RaffleCreated(
        uint256 indexed raffleId,
        uint256 indexed tokenId,
        address indexed nftAddress,
        uint256 ticketPrice,
        uint256 maxTickets
    );

    event TicketPurchased(
        uint256 indexed raffleId,
        uint256 indexed tokenId,
        address indexed nftAddress,
        address ticketOwner
    );

    event RaffleClosed(uint256 indexed raffleId, uint64 indexed sequenceNumber);

    event RaffleDrawn(
        uint256 indexed raffleId,
        uint256 indexed ticketNumber,
        address winner
    );

    mapping(uint256 => Raffle) public raffles;
    uint256 public raffleCount;

    IEntropy private entropy;
    address private entropyProvider;

    constructor(address _entropyAddress, address _entropyProviderAddress) {
        entropy = IEntropy(_entropyAddress);
        entropyProvider = _entropyProviderAddress;
    }

    function getRaffle(
        uint256 _raffleId
    ) external view returns (Raffle memory) {
        return raffles[_raffleId];
    }

    function getFee() external view returns (uint256) {
        return entropy.getFee(entropyProvider);
    }

    function createRaffle(
        uint256 _tokenId,
        address _nftAddress,
        uint256 _ticketPrice,
        uint256 _maxTickets
    ) external {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 1, "Max tickets must be greater than 1");
        require(
            _maxTickets <= 100,
            "Max tickets must be less than or equal to 100"
        );

        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _tokenId);

        raffleCount++;
        raffles[raffleCount] = Raffle({
            raffleOwner: msg.sender,
            tokenId: _tokenId,
            nftAddress: _nftAddress,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            ticketOwners: new address[](0),
            winningTicket: 0,
            sequenceNumber: 0,
            entropyFee: 0
        });

        emit RaffleCreated(
            raffleCount,
            _tokenId,
            _nftAddress,
            _ticketPrice,
            _maxTickets
        );
    }

    function purchaseTicket(uint256 _raffleId) external payable {
        Raffle storage raffle = raffles[_raffleId];
        require(
            raffle.ticketOwners.length < raffle.maxTickets,
            "Raffle is sold out"
        );
        require(msg.value == raffle.ticketPrice, "Incorrect ticket price");

        raffle.ticketOwners.push(msg.sender);
        emit TicketPurchased(
            _raffleId,
            raffle.tokenId,
            raffle.nftAddress,
            msg.sender
        );
    }

    function closeRaffle(
        uint256 _raffleId,
        bytes32 _userCommitment
    ) external payable {
        Raffle storage raffle = raffles[_raffleId];
        require(
            raffle.ticketOwners.length == raffle.maxTickets,
            "Raffle is not sold out"
        );
        require(raffle.sequenceNumber == 0, "Raffle has already been drawn");

        uint256 fee = entropy.getFee(entropyProvider);
        uint64 sequenceNumber = entropy.request{value: fee}(
            entropyProvider,
            _userCommitment,
            true
        );
        raffle.sequenceNumber = sequenceNumber;
        raffle.entropyFee = fee;
        emit RaffleClosed(_raffleId, sequenceNumber);
    }

    function drawRaffle(
        uint256 _raffleId,
        uint64 _sequenceNumber,
        bytes32 _userRandom,
        bytes32 _providerRandom
    ) public {
        Raffle storage raffle = raffles[_raffleId];
        require(
            raffle.sequenceNumber == _sequenceNumber,
            "Invalid sequence number"
        );

        require(raffle.sequenceNumber != 0, "Raffle has not been closed");

        bytes32 randomNumber = entropy.reveal(
            entropyProvider,
            _sequenceNumber,
            _userRandom,
            _providerRandom
        );

        uint256 winningTicket = uint256(randomNumber) % raffle.maxTickets;
        address winnerAddress = raffle.ticketOwners[winningTicket];

        raffle.winningTicket = winningTicket;
        IERC721(raffle.nftAddress).transferFrom(
            address(this),
            winnerAddress,
            raffle.tokenId
        );

        uint256 userEth = raffle.ticketPrice *
            raffle.ticketOwners.length -
            raffle.entropyFee;
        (bool sent, ) = raffle.raffleOwner.call{value: userEth}("");
        require(sent, "Failed to send Ether");
        emit RaffleDrawn(_raffleId, winningTicket, winnerAddress);
    }
}
