pragma solidity ^0.4.21;

contract RewardToken {

    uint8 public decimals = 18;

    uint256 public totalSupply = 1000000 * (uint256(10) ** decimals);

    mapping(address => uint256) public balanceOf;

    function RewardToken() public {
        // Initially assign all tokens to the contract's creator.
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    uint256 public scaling = uint256(10) ** 8;

    mapping(address => uint256) public scaledDividendBalanceOf;

    uint256 public scaledDividendPerToken;

    mapping(address => uint256) public scaledDividendCreditedTo;

    function getTotalSupply () public view returns (uint256) {
      return totalSupply;
    }

    function update(address account) public {
        uint256 owed =
            scaledDividendPerToken - scaledDividendCreditedTo[account];
        scaledDividendBalanceOf[account] += balanceOf[account] * owed;
        scaledDividendCreditedTo[account] = scaledDividendPerToken;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    mapping(address => mapping(address => uint256)) public allowance;

    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value);

        update(msg.sender);
        update(to);

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value)
        public
        returns (bool success)
    {

        require (_value <= balanceOf[_from]);
        require (_value <= allowance[_from][msg.sender]);

        update(_from);
        update(_to);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer (_from, _to, _value);
        return true;
    }

    uint256 public scaledRemainder = 0;

    function deposit() public payable {
        // scale the deposit and add the previous remainder
        uint256 available = (msg.value * scaling) + scaledRemainder;

        scaledDividendPerToken += available / totalSupply;

        // compute the new remainder
        scaledRemainder = available % totalSupply;
    }

    function withdraw() public {
        update(msg.sender);
        uint256 amount = scaledDividendBalanceOf[msg.sender] / scaling;
        scaledDividendBalanceOf[msg.sender] %= scaling;  // retain the remainder
        msg.sender.transfer(amount);
    }

    function balanceOf(address _account) public view returns (uint256) {
      return balanceOf[_account];
    }

    function dividendBalanceOf(address _account) public view returns (uint256){
    //  update (_account);
      return scaledDividendBalanceOf[_account] / scaling;
    }

    function approve(address spender, uint256 value)
        public
        returns (bool success)
    {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

}
