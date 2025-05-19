// deployed at - 0x072cf4b2ce0742f6afdf0956a1e8ee79a7f3ef2696f5f5f115b688c3c831ccb7


#[starknet::interface]
trait STKTWT<T> {
    fn user_profile(ref self: T, name: felt252);
    fn create_tweet(ref self: T, tweet: felt252);
    fn get_name(self: @T, addr: starknet::ContractAddress) -> felt252;
    fn get_tweets(self: @T, addr: starknet::ContractAddress) -> Array<felt252>;
    fn get_all_tweets(self: @T, start_idx: u32, limit: u32) -> Array<(starknet::ContractAddress, felt252)>;
    fn get_global_tweet_count(self: @T) -> u32;
    fn create_tweet_with_media(ref self: T, tweet: felt252, media_uri: felt252);
    fn like_tweet(ref self: T, tweet_id: u32);
    fn get_tweet_likes(self: @T, tweet_id: u32) -> u32;
    fn set_profile_picture(ref self: T, profile_pic_uri: felt252);
    fn get_profile_picture(self: @T, addr: starknet::ContractAddress) -> felt252;
    fn get_has_liked_tweet(self: @T, user: starknet::ContractAddress, tweet_id: u32) -> bool;
    fn get_tweet_with_media(self: @T, tweet_id: u32) -> (starknet::ContractAddress, felt252, felt252, u32);
}

#[starknet::contract]
mod StarkTweet {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use core::array::ArrayTrait;
    use core::traits::Into;
    use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess, Map, StoragePointerReadAccess, StoragePointerWriteAccess};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,

        name: Map<ContractAddress, felt252>,
        token_id: u256,
        
        tweet_count: Map<ContractAddress, u32>,
        tweets:Map<(ContractAddress, u32), felt252>,
        
        global_tweet_count: u32,
        global_tweets: Map<u32, (ContractAddress, felt252)>, 
        
        tweet_media: Map<u32, felt252>, 
        
        profile_pictures: Map<ContractAddress, felt252>, 
        
        tweet_likes: Map<u32, u32>, 
        user_likes: Map<(ContractAddress, u32), bool>, 
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        TweetCreated: TweetCreated,
        MediaTweetCreated: MediaTweetCreated,
        TweetLiked: TweetLiked,
        ProfilePictureSet: ProfilePictureSet,
    }

    #[derive(Drop, starknet::Event)]
    struct TweetCreated {
        author: ContractAddress,
        tweet_id: u32,
        content: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct MediaTweetCreated {
        author: ContractAddress,
        tweet_id: u32,
        content: felt252,
        media_uri: felt252,
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct TweetLiked {
        user: ContractAddress,
        tweet_id: u32,
        new_like_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct ProfilePictureSet {
        user: ContractAddress,
        profile_pic_uri: felt252,
        token_id: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
       
    ) {
        let name = "StarkTweet";
        let symbol = "STKTWT";
        
        let token_id = 0_u256;
        self.global_tweet_count.write(0_u32);
        self.token_id.write(token_id);

        self.erc721.initializer(name, symbol, "");
    }

    #[abi(embed_v0)]
    impl STK of super::STKTWT<ContractState> {
        fn user_profile(ref self: ContractState, name: felt252) {
            let caller = get_caller_address();
            self.name.write(caller, name);
        }

        fn get_name(self: @ContractState, addr: ContractAddress) -> felt252 {
            self.name.read(addr)
        }
      
        fn create_tweet(ref self: ContractState, tweet: felt252) {
            let caller = get_caller_address();
            
            let current_user_count = self.tweet_count.read(caller);
            self.tweets.write((caller, current_user_count), tweet);
            self.tweet_count.write(caller, current_user_count + 1_u32);
            
            let global_idx = self.global_tweet_count.read();
            self.global_tweets.write(global_idx, (caller, tweet));
            self.global_tweet_count.write(global_idx + 1_u32);
            
            self.tweet_likes.write(global_idx, 0_u32);
            
            self.emit(TweetCreated {
                author: caller,
                tweet_id: global_idx,
                content: tweet
            });
        }

        fn get_tweets(self: @ContractState, addr: ContractAddress) -> Array<felt252> {
            let count = self.tweet_count.read(addr);
            let mut tweets_array = ArrayTrait::new();
            
            let mut i: u32 = 0;
            while i < count {
                let tweet = self.tweets.read((addr, i));
                tweets_array.append(tweet);
                i += 1_u32;
            }
            
            tweets_array
        }
        
        fn get_all_tweets(self: @ContractState, start_idx: u32, limit: u32) -> Array<(ContractAddress, felt252)> {
            let total_tweets = self.global_tweet_count.read();
            let mut result = ArrayTrait::new();
            
            let mut i = start_idx;
            let end_idx = if start_idx + limit < total_tweets {
                start_idx + limit
            } else {
                total_tweets
            };
            
            while i < end_idx {
                let tweet_data = self.global_tweets.read(i);
                result.append(tweet_data);
                i += 1_u32;
            }
            
            result
        }
        
        fn get_global_tweet_count(self: @ContractState) -> u32 {
            self.global_tweet_count.read()
        }

        fn create_tweet_with_media(ref self: ContractState, tweet: felt252, media_uri: felt252) {
            let caller = get_caller_address();
            
            let current_user_count = self.tweet_count.read(caller);
            self.tweets.write((caller, current_user_count), tweet);
            self.tweet_count.write(caller, current_user_count + 1_u32);
            
            let global_idx = self.global_tweet_count.read();
            self.global_tweets.write(global_idx, (caller, tweet));

             let mut uri_array = ArrayTrait::new();
            uri_array.append(media_uri);
            let uri_span = uri_array.span();
            
            self.tweet_media.write(global_idx, media_uri);
            
            self.tweet_likes.write(global_idx, 0_u32);
            
            let current_token_id = self.token_id.read();
            self.erc721.safe_mint(caller, current_token_id, uri_span);
            
            
            self.token_id.write(current_token_id + 1_u256);
            
            self.global_tweet_count.write(global_idx + 1_u32);
            
            self.emit(MediaTweetCreated {
                author: caller,
                tweet_id: global_idx,
                content: tweet,
                media_uri: media_uri,
                token_id: current_token_id
            });
        }
        
        fn like_tweet(ref self: ContractState, tweet_id: u32) {
            let caller = get_caller_address();
            let total_tweets = self.global_tweet_count.read();
            
            assert(tweet_id < total_tweets, 'Tweet does not exist');
            
            let already_liked = self.user_likes.read((caller, tweet_id));
            assert(!already_liked, 'Already liked this tweet');
            
            let current_likes = self.tweet_likes.read(tweet_id);
            let new_like_count = current_likes + 1_u32;
            self.tweet_likes.write(tweet_id, new_like_count);
            
            self.user_likes.write((caller, tweet_id), true);
            
            self.emit(TweetLiked {
                user: caller,
                tweet_id: tweet_id,
                new_like_count: new_like_count
            });
        }
        
        fn get_tweet_likes(self: @ContractState, tweet_id: u32) -> u32 {
            self.tweet_likes.read(tweet_id)
        }
        
        fn get_has_liked_tweet(self: @ContractState, user: ContractAddress, tweet_id: u32) -> bool {
            self.user_likes.read((user, tweet_id))
        }
        
        fn set_profile_picture(ref self: ContractState, profile_pic_uri: felt252) {
            let caller = get_caller_address();
            
            self.profile_pictures.write(caller, profile_pic_uri);
            let mut uri_array = ArrayTrait::new();
            uri_array.append(profile_pic_uri);
            let uri_span = uri_array.span();
            let current_token_id = self.token_id.read();
            self.erc721.safe_mint(caller, current_token_id, uri_span);
            
           
            
            self.token_id.write(current_token_id + 1_u256);
            
            self.emit(ProfilePictureSet {
                user: caller,
                profile_pic_uri: profile_pic_uri,
                token_id: current_token_id
            });
        }
        
        fn get_profile_picture(self: @ContractState, addr: ContractAddress) -> felt252 {
            self.profile_pictures.read(addr)
        }
        
        fn get_tweet_with_media(self: @ContractState, tweet_id: u32) -> (ContractAddress, felt252, felt252, u32) {
            let total_tweets = self.global_tweet_count.read();
            assert(tweet_id < total_tweets, 'Tweet does not exist');
            
            let (author, content) = self.global_tweets.read(tweet_id);
            let media_uri = self.tweet_media.read(tweet_id);
            let likes = self.tweet_likes.read(tweet_id);
            
            (author, content, media_uri, likes)
        }
    }
}