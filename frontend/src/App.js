import React, { useState, useEffect } from "react";
import { RpcProvider, Contract, shortString } from "starknet";
import axios from "axios";
import "./App.css";

// ----------- CONFIG -----------
const CONTRACT_ADDRESS = "0x072cf4b2ce0742f6afdf0956a1e8ee79a7f3ef2696f5f5f115b688c3c831ccb7";
const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/FCyLgvgy4q9oa_OScl33IgtjRYHNr1gP"
});
const contractABI = [
  {
    "name": "STK",
    "type": "impl",
    "interface_name": "backend::StarkTweet::STKTWT"
  },
  {
    "name": "core::bool",
    "type": "enum",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "name": "backend::StarkTweet::STKTWT",
    "type": "interface",
    "items": [
      {
        "name": "user_profile",
        "type": "function",
        "inputs": [
          {
            "name": "name",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "create_tweet",
        "type": "function",
        "inputs": [
          {
            "name": "tweet",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_name",
        "type": "function",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_tweets",
        "type": "function",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_all_tweets",
        "type": "function",
        "inputs": [
          {
            "name": "start_idx",
            "type": "core::integer::u32"
          },
          {
            "name": "limit",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<(core::starknet::contract_address::ContractAddress, core::felt252)>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_global_tweet_count",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "create_tweet_with_media",
        "type": "function",
        "inputs": [
          {
            "name": "tweet",
            "type": "core::felt252"
          },
          {
            "name": "media_uri",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "like_tweet",
        "type": "function",
        "inputs": [
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_tweet_likes",
        "type": "function",
        "inputs": [
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "set_profile_picture",
        "type": "function",
        "inputs": [
          {
            "name": "profile_pic_uri",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_profile_picture",
        "type": "function",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_has_liked_tweet",
        "type": "function",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_tweet_with_media",
        "type": "function",
        "inputs": [
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "(core::starknet::contract_address::ContractAddress, core::felt252, core::felt252, core::integer::u32)"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "ERC721MixinImpl",
    "type": "impl",
    "interface_name": "openzeppelin_token::erc721::interface::ERC721ABI"
  },
  {
    "name": "core::integer::u256",
    "type": "struct",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "name": "core::array::Span::<core::felt252>",
    "type": "struct",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    "name": "core::byte_array::ByteArray",
    "type": "struct",
    "members": [
      {
        "name": "data",
        "type": "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        "name": "pending_word",
        "type": "core::felt252"
      },
      {
        "name": "pending_word_len",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "name": "openzeppelin_token::erc721::interface::ERC721ABI",
    "type": "interface",
    "items": [
      {
        "name": "balance_of",
        "type": "function",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "owner_of",
        "type": "function",
        "inputs": [
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "safe_transfer_from",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_id",
            "type": "core::integer::u256"
          },
          {
            "name": "data",
            "type": "core::array::Span::<core::felt252>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "transfer_from",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "approve",
        "type": "function",
        "inputs": [
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "set_approval_for_all",
        "type": "function",
        "inputs": [
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "approved",
            "type": "core::bool"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_approved",
        "type": "function",
        "inputs": [
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "is_approved_for_all",
        "type": "function",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "supports_interface",
        "type": "function",
        "inputs": [
          {
            "name": "interface_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "name",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "symbol",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "token_uri",
        "type": "function",
        "inputs": [
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "balanceOf",
        "type": "function",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "ownerOf",
        "type": "function",
        "inputs": [
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "safeTransferFrom",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          },
          {
            "name": "data",
            "type": "core::array::Span::<core::felt252>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "transferFrom",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "setApprovalForAll",
        "type": "function",
        "inputs": [
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "approved",
            "type": "core::bool"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "getApproved",
        "type": "function",
        "inputs": [
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "isApprovedForAll",
        "type": "function",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "tokenURI",
        "type": "function",
        "inputs": [
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "constructor",
    "type": "constructor",
    "inputs": []
  },
  {
    "kind": "struct",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::Transfer",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "from",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "to",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::Approval",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "approved",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::ApprovalForAll",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "operator",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "approved",
        "type": "core::bool"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "Transfer",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::Transfer"
      },
      {
        "kind": "nested",
        "name": "Approval",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::Approval"
      },
      {
        "kind": "nested",
        "name": "ApprovalForAll",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::ApprovalForAll"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_introspection::src5::SRC5Component::Event",
    "type": "event",
    "variants": []
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::TweetCreated",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "author",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "tweet_id",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "content",
        "type": "core::felt252"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::MediaTweetCreated",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "author",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "tweet_id",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "content",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "media_uri",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::TweetLiked",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "tweet_id",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "new_like_count",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::ProfilePictureSet",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "profile_pic_uri",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "backend::StarkTweet::StarkTweet::Event",
    "type": "event",
    "variants": [
      {
        "kind": "flat",
        "name": "ERC721Event",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::Event"
      },
      {
        "kind": "flat",
        "name": "SRC5Event",
        "type": "openzeppelin_introspection::src5::SRC5Component::Event"
      },
      {
        "kind": "nested",
        "name": "TweetCreated",
        "type": "backend::StarkTweet::StarkTweet::TweetCreated"
      },
      {
        "kind": "nested",
        "name": "MediaTweetCreated",
        "type": "backend::StarkTweet::StarkTweet::MediaTweetCreated"
      },
      {
        "kind": "nested",
        "name": "TweetLiked",
        "type": "backend::StarkTweet::StarkTweet::TweetLiked"
      },
      {
        "kind": "nested",
        "name": "ProfilePictureSet",
        "type": "backend::StarkTweet::StarkTweet::ProfilePictureSet"
      }
    ]
  }
]; 

// Pinata keys (for development only - in production, use environment variables)
const PINATA_API_KEY = "fd525a94d45c0f00c74d";
const PINATA_SECRET_API_KEY = "6c0e69b3d9356855f2de1df6e1e9dbe0797f5999d451b3477d3b6a350cf70796";

// ----------- APP -----------
function App() {
  // State
  const [account, setAccount] = useState(null);
  const [address, setAddress] = useState("");
  const [readContract, setReadContract] = useState(null);
  const [writeContract, setWriteContract] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: "", profilePic: "" });
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  // Tweet
  const [tweetText, setTweetText] = useState("");
  const [tweetMedia, setTweetMedia] = useState(null);
  const [isUploadingTweet, setIsUploadingTweet] = useState(false);

  // ----------- INIT -----------
  useEffect(() => {
    // Initialize with the provider for read-only operations
    setReadContract(new Contract(contractABI, CONTRACT_ADDRESS, provider));
  }, []);

  // Update data when account/address changes
  useEffect(() => {
    if (account && address) {
      // Set up write contract with the connected account
      setWriteContract(new Contract(contractABI, CONTRACT_ADDRESS, account));
      
      // Only fetch user data if we have an account connected
      fetchUserProfile();
      fetchTweets();
    }
  }, [account, address]);

  // ----------- WALLET CONNECT -----------
  const connectWallet = async () => {
    if (!window.starknet) {
      showError("Install Argent X or Braavos wallet extension.");
      return;
    }
    try {
      setLoading(true);
      await window.starknet.enable();
      
      if (!window.starknet.isConnected || !window.starknet.selectedAddress) {
        showError("Wallet connection failed.");
        setLoading(false);
        return;
      }
      
      setAccount(window.starknet.account);
      setAddress(window.starknet.selectedAddress);
      
      // Initialize write contract with connected account
      setWriteContract(new Contract(contractABI, CONTRACT_ADDRESS, window.starknet.account));
      
      showNotification("Wallet connected!");
      setLoading(false);
    } catch (err) {
      showError("Wallet connection error: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  // ----------- PINATA UPLOAD -----------
  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
            "Content-Type": "multipart/form-data",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
      
      if (!response.data || !response.data.IpfsHash) {
        throw new Error("Pinata upload failed - missing hash");
      }
      
      return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Pinata upload error:", error);
      throw new Error(`Pinata upload failed: ${error.message}`);
    }
  };

  // ----------- FELT UTILS -----------
  const stringToFelt = (str) => {
    try {
      return shortString.encodeShortString(str.slice(0, 31));
    } catch (error) {
      console.error("Error encoding string to felt:", error);
      return shortString.encodeShortString(str.slice(0, 31));
    }
  };
  
  const feltToString = (felt) => {
    if (!felt || felt === "0x0") return "";
    
    try {
      let val = felt;
      if (typeof felt === "bigint" || typeof felt === "number") {
        val = "0x" + felt.toString(16);
      }
      if (typeof val === "string" && val.startsWith("0x")) {
        return shortString.decodeShortString(val);
      }
      return val.toString();
    } catch (error) {
      console.error("Error decoding felt to string:", error);
      return felt.toString();
    }
  };

  // ----------- PROFILE -----------
  const fetchUserProfile = async () => {
    if (!readContract || !address) return;
    
    try {
      setLoading(true);
      
      // We'll use a try-catch for each separate call to handle failures gracefully
      let name = "";
      let profilePicUri = "";
      
      try {
        // Always use readContract for read operations
        const nameResult = await readContract.get_name(address);
        name = nameResult && nameResult.length > 0 ? feltToString(nameResult[0]) : "";
      } catch (err) {
        console.error("Failed to fetch username:", err);
      }
      
      try {
        const profilePicResult = await readContract.get_profile_picture(address);
        profilePicUri = profilePicResult && profilePicResult.length > 0 ? feltToString(profilePicResult[0]) : "";
      } catch (err) {
        console.error("Failed to fetch profile picture:", err);
      }
      
      setUserProfile({
        name,
        profilePic: profilePicUri
      });
      
      setUsername(name || "");
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      showError("Failed to fetch user profile: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  const updateUserProfile = async () => {
    if (!writeContract || !username) {
      showError("Enter a username and connect wallet.");
      return;
    }
    
    try {
      setLoading(true);
      showNotification("Updating profile...");
      
      const usernameFelt = stringToFelt(username);
      // Use writeContract for write operations
      const tx = await writeContract.invoke("user_profile", [usernameFelt]);
      
      // Show a notification while waiting
      showNotification("Transaction submitted. Waiting for confirmation...");
      
      await provider.waitForTransaction(tx.transaction_hash);
      showNotification("Profile updated successfully!");
      
      // Refresh profile data
      await fetchUserProfile();
    } catch (err) {
      console.error("Profile update failed:", err);
      showError("Profile update failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePic || !writeContract) {
      showError("Select a profile picture and connect wallet.");
      return;
    }
    
    try {
      setIsUploadingProfile(true);
      showNotification("Uploading profile picture...");
      
      const imageUrl = await uploadToPinata(profilePic);
      const imageUriFelt = stringToFelt(imageUrl);
      
      // Use writeContract for write operations
      const tx = await writeContract.invoke("set_profile_picture", [imageUriFelt]);
      
      showNotification("Transaction submitted. Waiting for confirmation...");
      await provider.waitForTransaction(tx.transaction_hash);
      
      showNotification("Profile picture updated successfully!");
      await fetchUserProfile();
      setProfilePic(null);
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      showError("Failed to update profile picture: " + (err.message || "Unknown error"));
    } finally {
      setIsUploadingProfile(false);
    }
  };

  // ----------- TWEETS -----------
  const fetchTweets = async () => {
    if (!readContract) return;
    
    try {
      setLoading(true);
      
      // Get total tweet count
      let tweetCount = 0;
      try {
        // Use readContract for read operations
        const tweetCountResult = await readContract.get_global_tweet_count();
        tweetCount = parseInt(tweetCountResult[0]?.toString() || "0");
      } catch (err) {
        console.error("Failed to get tweet count:", err);
        showError("Failed to fetch tweet count");
        setLoading(false);
        return;
      }
      
      if (tweetCount === 0) {
        setTweets([]);
        setLoading(false);
        return;
      }
      
      // Fetch tweets with pagination - max 10 at a time to reduce failures
      const fetchedTweets = [];
      const batchSize = 10;
      
      for (let i = 0; i < Math.min(tweetCount, 50); i++) {
        try {
          // Always use readContract for read operations
          const tweetWithMedia = await readContract.get_tweet_with_media(i);
          
          // Get likes count separately
          let likeCount = 0;
          try {
            const likes = await readContract.get_tweet_likes(i);
            likeCount = parseInt(likes[0]?.toString() || "0");
          } catch (err) {
            console.error(`Failed to get likes for tweet ${i}:`, err);
          }
          
          const author = tweetWithMedia[0];
          const content = feltToString(tweetWithMedia[1]);
          const mediaUri = tweetWithMedia[2] && tweetWithMedia[2] !== "0x0"
            ? feltToString(tweetWithMedia[2])
            : null;
            
          let authorName = "";
          let authorProfilePic = "";
          
          try {
            const authorNameResult = await readContract.get_name(author);
            authorName = authorNameResult && authorNameResult.length > 0 
              ? feltToString(authorNameResult[0]) 
              : "";
          } catch (err) {
            console.error(`Failed to get name for author ${author}:`, err);
          }
          
          try {
            const authorProfilePicResult = await readContract.get_profile_picture(author);
            authorProfilePic = authorProfilePicResult && authorProfilePicResult.length > 0
              ? feltToString(authorProfilePicResult[0])
              : "";
          } catch (err) {
            console.error(`Failed to get profile pic for author ${author}:`, err);
          }
          
          fetchedTweets.push({
            id: i,
            author,
            authorName,
            authorProfilePic,
            content,
            mediaUri,
            likeCount,
          });
          
          // Add a small delay between batches
          if (i % batchSize === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error(`Failed to fetch tweet ${i}:`, err);
          // Skip this tweet and continue
        }
      }
      
      setTweets(fetchedTweets.reverse());
    } catch (err) {
      console.error("Failed to fetch tweets:", err);
      showError("Failed to fetch tweets: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const createTweet = async () => {
    if (!writeContract || !tweetText) {
      showError("Enter tweet text and connect wallet.");
      return;
    }
    
    try {
      setLoading(true);
      showNotification("Creating tweet...");
      
      const tweetFelt = stringToFelt(tweetText);
      let tx;
      
      if (tweetMedia) {
        setIsUploadingTweet(true);
        const mediaUrl = await uploadToPinata(tweetMedia);
        const mediaUriFelt = stringToFelt(mediaUrl);
        // Use writeContract for write operations
        tx = await writeContract.invoke("create_tweet_with_media", [tweetFelt, mediaUriFelt]);
      } else {
        // Use writeContract for write operations
        tx = await writeContract.invoke("create_tweet", [tweetFelt]);
      }
      
      showNotification("Transaction submitted. Waiting for confirmation...");
      await provider.waitForTransaction(tx.transaction_hash);
      
      showNotification("Tweet created successfully!");
      setTweetText("");
      setTweetMedia(null);
      
      // Refresh tweets after a short delay
      setTimeout(() => fetchTweets(), 1000);
    } catch (err) {
      console.error("Failed to create tweet:", err);
      showError("Failed to create tweet: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
      setIsUploadingTweet(false);
    }
  };

  // ----------- LIKES -----------
  const likeTweet = async (tweetId) => {
    if (!writeContract || !account) {
      showError("Connect wallet to like tweets.");
      return;
    }
    
    try {
      setLoading(true);
      showNotification("Liking tweet...");
      
      // Use writeContract for write operations
      const tx = await writeContract.invoke("like_tweet", [tweetId]);
      
      showNotification("Transaction submitted. Waiting for confirmation...");
      await provider.waitForTransaction(tx.transaction_hash);
      
      showNotification("Tweet liked!");
      
      // Refresh tweets after a short delay
      setTimeout(() => fetchTweets(), 1000);
    } catch (err) {
      console.error("Failed to like tweet:", err);
      showError("Failed to like tweet: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // ----------- HELPERS -----------
  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showError("File too large. Max 5MB.");
      return;
    }
    
    if (type === "profile") setProfilePic(file);
    else if (type === "tweet") setTweetMedia(file);
  };
  
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  const showError = (msg) => { 
    setError(msg); 
    setTimeout(() => setError(""), 5000); 
  };
  
  const showNotification = (msg) => { 
    setNotification(msg); 
    setTimeout(() => setNotification(""), 5000); 
  };

  // ----------- UI -----------
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo"><span>🔵</span><h1>StarkTweet</h1></div>
          {!account ? (
            <button onClick={connectWallet} disabled={loading} className="connect-button">
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="user-info">
              {userProfile.profilePic && <img src={userProfile.profilePic} alt="Profile" className="header-profile-pic" />}
              <div className="user-details">
                <span className="username">{userProfile.name || "Unnamed User"}</span>
                <span className="address">{formatAddress(address)}</span>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">{sidebarOpen ? "✕" : "☰"}</button>
            </div>
          )}
        </div>
      </header>
      
      {/* Notifications */}
      {notification && <div className="notification">{notification}</div>}
      {error && <div className="error-message">{error}<button onClick={() => setError("")}>✕</button></div>}
      
      {/* Sidebar */}
      {account && (
        <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-header"><h2>Profile</h2></div>
          <div className="sidebar-content">
            <div className="current-profile">
              {userProfile.profilePic ? <img src={userProfile.profilePic} alt="Profile" className="profile-pic-preview" /> : <div className="profile-pic-placeholder"><span>👤</span></div>}
              <h3>{userProfile.name || "Set your username"}</h3>
            </div>
            <div className="profile-section">
              <h3>Set Username</h3>
              <input type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} className="input-field" />
              <button onClick={updateUserProfile} disabled={loading} className="action-button">
                {loading ? "Updating..." : "Update Username"}
              </button>
            </div>
            <div className="profile-section">
              <h3>Profile Picture</h3>
              <label className="file-input-label">Choose Image
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "profile")} className="file-input" />
              </label>
              {profilePic && (
                <div className="file-preview">
                  <img src={URL.createObjectURL(profilePic)} alt="Preview" className="preview-image" />
                  <button onClick={() => setProfilePic(null)} className="remove-preview">✕</button>
                </div>
              )}
              <button onClick={uploadProfilePicture} disabled={isUploadingProfile || !profilePic} className="action-button">
                {isUploadingProfile ? "Uploading..." : "Update Profile Picture"}
              </button>
            </div>
            <div className="profile-section">
              <h3>Create Tweet</h3>
              <textarea placeholder="What's happening?" value={tweetText} onChange={e => setTweetText(e.target.value)} className="tweet-input" rows="4" />
              <label className="file-input-label">Add Media
                <input type="file" accept="image/*,video/*" onChange={e => handleFileUpload(e, "tweet")} className="file-input" />
              </label>
              {tweetMedia && (
                <div className="file-preview">
                  <img src={URL.createObjectURL(tweetMedia)} alt="Preview" className="preview-image" />
                  <button onClick={() => setTweetMedia(null)} className="remove-preview">✕</button>
                </div>
              )}
              <button onClick={createTweet} disabled={loading || isUploadingTweet || !tweetText} className="action-button tweet-button">
                {isUploadingTweet ? "Uploading..." : loading ? "Posting..." : "Tweet"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      
      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? "with-sidebar" : ""}`}>
        {account ? (
          <div className="tweets-container">
            <div className="tweets-header">
              <h2>Latest Tweets</h2>
              <button onClick={fetchTweets} disabled={loading} className="refresh-button">
                {loading ? "Loading..." : "🔄 Refresh"}
              </button>
            </div>
            {loading && tweets.length === 0 ? (
              <div className="loading"><div className="loading-spinner"></div><p>Loading tweets...</p></div>
            ) : tweets.length === 0 ? (
              <div className="no-tweets"><div className="empty-state-icon">📝</div><p>No tweets yet. Be the first to tweet!</p></div>
            ) : (
              <div className="tweets-list">
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="tweet">
                    <div className="tweet-header">
                      <div className="tweet-author">
                        {tweet.authorProfilePic ? <img src={tweet.authorProfilePic} alt="Profile" className="author-avatar" /> : <div className="author-avatar-placeholder">👤</div>}
                        <div className="author-info">
                          <span className="author-name">{tweet.authorName || "Unnamed User"}</span>
                          <span className="author-address">{formatAddress(tweet.author)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="tweet-content">
                      <p>{tweet.content}</p>
                      {tweet.mediaUri && (
                        <div className="tweet-media">
                          <img src={tweet.mediaUri} alt="Tweet media" className="media-image" />
                        </div>
                      )}
                    </div>
                    <div className="tweet-actions">
                      <div className="tweet-id">Tweet #{tweet.id}</div>
                      <button 
                        onClick={() => likeTweet(tweet.id)} 
                        className="like-button" 
                        disabled={loading}
                      >
                        ❤️ {tweet.likeCount}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-icon">🌟</div>
            <h2>Welcome to StarkTweet</h2>
            <p>Decentralized social media on Starknet</p>
            {/* Only show connect button if not already in header */}
            {window.innerWidth <= 768 && (
              <button onClick={connectWallet} disabled={loading} className="connect-button large">
                {loading ? "Connecting..." : "Connect Wallet to Start"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;