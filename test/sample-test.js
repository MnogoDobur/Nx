const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Lottery", async () => {
  let proxy, ticket, factory;
  let proxyAddress,ticketAddress;
  let proxiedTicket,newProxiedTicket;

  before(async () => {
    [owner] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.deployed();

    await factory.createProxyContract("NFT Lottery","NFT",123);
    const proxyAddress = factory.getProxyAddress(0);

    const Ticket = await ethers.getContractFactory("Ticket");
    proxiedTicket = Ticket.attach(proxyAddress);

    const myProxy = await ethers.getContractFactory("myProxy");
    proxy = myProxy.attach(proxyAddress);
  });

  // beforeEach(async () => {
  //   random = await proxiedTicket.getRand();
  //   console.log(random,"random for 1st proxy now");
  // });

  it("Check if proxy points to the correct implementation",async() => {
    const ticketAddress = await factory.getTicketAddress();
    const impAdress = await proxy.getImplementation()
    expect(impAdress).to.equals(ticketAddress);
  })

  it("Reverts minting while sale hasn't started", async() => {
    [owner] = await ethers.getSigners();
    await expect(proxiedTicket.mintNft(1,{
      value: ethers.utils.parseEther("0.02")})).to.be.revertedWith("Sale hasn't started yet");
  })

  it("Should start sale",async() => {
    await proxiedTicket.startSale();
  })

  it("Reverts if Ether sent for minting is not sufficient", async() => {
    [owner] = await ethers.getSigners();
    await expect(proxiedTicket.mintNft(1,{
      value: ethers.utils.parseEther("0.002")})).to.be.revertedWith("Eth passed is less or greater than required");
  })

  it("Minting 10 NFTs from owner account", async() => {
    [owner] = await ethers.getSigners();
    const mintNft = await proxiedTicket.mintNft(10,{
    value: ethers.utils.parseEther("0.2")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(1)).to.equal(owner.address);
  })

  it("Ensure metadata is initialized correctly - per token ID", async() => {
    const str = "ipfs://QmNyUdzfrdTsSaYDLL3KsW3AD9r35FoLzy4Y9nfPYmmubQ/1.json";
    expect(await proxiedTicket.tokenURI(1)).to.equal(str);
  })

  it("Minting 10 more NFTs from owner account and verifying ownership of atleast 1", async() => {
    [owner] = await ethers.getSigners();
    const mintNft = await proxiedTicket.mintNft(10,{
    value: ethers.utils.parseEther("0.2")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(11)).to.equal(owner.address);
  })

  it("Owner mints again, confirming checking the ownership", async() => {
    [owner] = await ethers.getSigners();
    const mintNft = await proxiedTicket.mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(21)).to.equal(owner.address);
  })

  it("Address1 mints ", async() => {
    const [addr1] = await ethers.getSigners();
    const mintNft = await proxiedTicket.connect(addr1).mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(22)).to.equal(addr1.address);
  })

  it("Minting more tickets", async() => {
    [owner] = await ethers.getSigners();
    const mintNft = await proxiedTicket.mintNft(10,{
    value: ethers.utils.parseEther("0.2")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(23)).to.equal(owner.address);
  })

  it("Address 2 mints", async() => {
    const [addr2] = await ethers.getSigners();
    const mintNft = await proxiedTicket.connect(addr2).mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(33)).to.equal(addr2.address);
  })

  it("Address 3 mints", async() => {
    const [addr3] = await ethers.getSigners();
    const mintNft = await proxiedTicket.connect(addr3).mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(34)).to.equal(addr3.address);
  })

  it("Minting more tickets", async() => {
    const [owner] = await ethers.getSigners();
    const mintNft = await proxiedTicket.connect(owner).mintNft(10,{
    value: ethers.utils.parseEther("0.2")});
    await mintNft.wait();
    
    expect(await proxiedTicket.ownerOf(35)).to.equal(owner.address);
  })

  it("Choosing a random winnder - supriseWinner()", async() => {
    balanceBefore = await proxiedTicket.ethBalance();
    const surpriseWinner = await proxiedTicket.surpriseWinner();
    await surpriseWinner.wait();
    balanceAfter = await proxiedTicket.ethBalance();

    console.log(balanceBefore,"balance before");
    console.log(balanceAfter,"balance after");
  })

  it("Closing the sale - closeSale()", async() => {
    balanceBefore = await proxiedTicket.ethBalance();
    const closeSale = await proxiedTicket.closeSale();
    await closeSale.wait();
    balanceAfter = await proxiedTicket.ethBalance()
    console.log(balanceBefore,"balance before");
    console.log(balanceAfter,"balance after");
  })

  it("Deploy new proxy", async() => {
    await factory.createProxyContract("NFT Lottery V2","NFT",1234);
    const proxyAddress = factory.getProxyAddress(1);

    const Ticket = await ethers.getContractFactory("Ticket");
    newProxiedTicket = Ticket.attach(proxyAddress);

  })

  it("Should start sale on new proxy",async() => {
    await newProxiedTicket.startSale();
  })

  it("Owner minting on the new proxy", async() => {
    [owner] = await ethers.getSigners();
    const mintNft = await newProxiedTicket.mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await newProxiedTicket.ownerOf(1)).to.equal(owner.address);

  })

  it("Address1 minting on new proxy", async() => {
    [addr1] = await ethers.getSigners();
    const mintNft = await newProxiedTicket.mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await newProxiedTicket.ownerOf(2)).to.equal(addr1.address);

  })

  it("Address2 minting on new proxy", async() => {
    [addr2] = await ethers.getSigners();
    const mintNft = await newProxiedTicket.mintNft(1,{
    value: ethers.utils.parseEther("0.02")});
    await mintNft.wait();
    
    expect(await newProxiedTicket.ownerOf(3)).to.equal(addr2.address);

  })

});
