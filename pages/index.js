import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { NFTCard } from './components/nftCard'
const Home = () => {
  const [wallet, setWalletAddress] = useState("")
  const [collection, setCollection] = useState("")
  const [totalSupply, setTotalSupply] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [NFTs, setNFTs] = useState([])

  const [fetchForCollection, setFetchForCollection] = useState(false)
  const apiKEY = 'lZLRqQIwj_pMYqZPihoeu-XKTh44YzZo'
  const options = { method: 'GET', headers: { Accept: 'application/json' } };
  const classNameForInput = "w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50"
  const handleWalletChange = (event) => {
    setWalletAddress(event.target.value)
  }
  const handleCollectionChange = (event) => {
    setCollection(event.target.value)
  }
  const handleCheckbox = () => {
    setFetchForCollection(oldValue => !oldValue)
  }
  const fetchNFTs = async () => {
    let nfts
    console.log('Fetching nfts')
    const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKEY}/getNFTs`
    if (!collection.length) {
      const fetchURL = `${baseURL}?owner=${wallet}`
      nfts = await fetch(fetchURL, options)
        .then(data => data.json())
        .catch(err => console.error(err));
    } else {
      const fetchURL = `${baseURL}?owner=${wallet}&contractAddresses[]=${collection}`
      nfts = await fetch(fetchURL, options)
        .then(data => data.json())
        .catch(err => console.error(err));
    }
    if (nfts) {
      console.log('Fetch nfts: ', nfts)
      setNFTs(nfts.ownedNfts)
    }
  }
  const handleButtonClick = () => {
    if (fetchForCollection) {
      getTotalSupplyOfCollection().then(() => fetchNFTsForCollection(0))
    } else {
      fetchNFTs()
    }
  }
  const getTotalSupplyOfCollection = async () => {
    const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKEY}/getContractMetadata`
    const finalURL = `${baseURL}?contractAddress=${collection}`
    const contractInfo = await fetch(finalURL, options)
      .then(data => data.json())
      .catch(err => console.error(err));
    if (contractInfo) {
      setTotalSupply(contractInfo.contractMetadata.totalSupply)
    }
  }
  const fetchNFTsForCollection = async (index) => {
    console.log(currentIndex, index)
    if (collection.length) {
      const apiKEY = 'lZLRqQIwj_pMYqZPihoeu-XKTh44YzZo'
      const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKEY}/getNFTsForCollection`
      const fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=true&startToken=${index * 100}`
      const nfts = await fetch(fetchURL, options)
        .then(data => data.json())
        .catch(err => console.error(err));
      if (nfts) {
        console.log('Nfts in collection: ', nfts)
        setNFTs(nfts.nfts)
      }
    }
  }
  const handleChangePage = (index) => {
    setCurrentIndex(index)
    fetchNFTsForCollection(index)
  }
  return (
    <div className="flex flex-col  items-center justify-center gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <input className={classNameForInput} disabled={fetchForCollection} type={"text"} placeholder="Add your wallet address" value={wallet} onChange={handleWalletChange}></input>
        <input className={classNameForInput} type={"text"} placeholder="Add the collection address" value={collection} onChange={handleCollectionChange}></input>
        <label className="text-gray-600"><input className="mr-2" checked={fetchForCollection} onChange={handleCheckbox} type={"checkbox"}></input>Fetch For Collection</label>
        <button className="disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5" onClick={handleButtonClick}>Let's go!</button>
      </div>
      <div className='flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center'>
        {
          NFTs.length && NFTs.map(nft => <NFTCard nft={nft} key={`${nft.contract.address}-${nft.id.tokenId}`} />)
        }
      </div>
      <div className='flex flex-wrap justify-center gap-x-2'>
        {
          Array.from(Array(Math.ceil(totalSupply / 100)).keys()).map(i => <button key={i} className={currentIndex === i ? 'underline' : ''} onClick={() => handleChangePage(i)}>{i}</button>)
        }
      </div>
    </div>
  )
}

export default Home
