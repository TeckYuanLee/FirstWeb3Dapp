const main = async () => {
	const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
	const waveContract = await waveContractFactory.deploy({
		value: hre.ethers.utils.parseEther('0.1'),
	  });
	await waveContract.deployed();
	console.log('Contract address:', waveContract.address);
  
	/*
   	* Get Contract balance
   	*/
	let contractBalance = await hre.ethers.provider.getBalance(
		waveContract.address
	);
	console.log(
		'Contract balance:',
		hre.ethers.utils.formatEther(contractBalance)
	);
	
	let cookiesCount;
	cookiesCount = await waveContract.getTotalCookies();
	console.log(cookiesCount.toNumber());
  
	/**
	 * Let's send a few cookies!
	 */
	let cookiesTxn = await waveContract.giveCookies('A message!');
	await cookiesTxn.wait(); // Wait for the transaction to be mined
  
	const [_, randomPerson] = await hre.ethers.getSigners();
	cookiesTxn = await waveContract.connect(randomPerson).giveCookies('Another message!');
	await cookiesTxn.wait(); // Wait for the transaction to be mined

	cookiesTxn = await waveContract.giveCookies('Spamming!');
	await cookiesTxn.wait(); // Wait for the transaction to be mined
  
	/*
   * Get Contract balance to see what happened!
   */
	contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
	console.log(
	  'Contract balance:',
	  hre.ethers.utils.formatEther(contractBalance)
	);
	
	let allCookies = await waveContract.getAllCookies();
	console.log(allCookies);
  };
  
  const runMain = async () => {
	try {
	  await main();
	  process.exit(0);
	} catch (error) {
	  console.log(error);
	  process.exit(1);
	}
  };
  
  runMain();