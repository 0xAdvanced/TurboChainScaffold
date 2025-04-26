module counter_addr::counter {
    use std::signer;
    
    /// 错误码
    const E_NOT_INITIALIZED: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    
    /// Counter资源结构
    struct Counter has key {
        value: u64,
        owner: address,
    }
    
    /// 初始化Counter
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // 创建Counter资源
        let counter = Counter {
            value: 0,
            owner: account_addr,
        };
        
        // 将Counter资源移动到账户存储中
        move_to(account, counter);
    }
    
    /// 增加计数器的值
    public entry fun increment(account: &signer) acquires Counter {
        let account_addr = signer::address_of(account);
        
        // 检查Counter资源是否存在
        assert!(exists<Counter>(account_addr), E_NOT_INITIALIZED);
        
        // 获取Counter资源的可变引用
        let counter = borrow_global_mut<Counter>(account_addr);
        
        // 增加值
        counter.value = counter.value + 1;
    }
    
    /// 减少计数器的值
    public entry fun decrement(account: &signer) acquires Counter {
        let account_addr = signer::address_of(account);
        
        // 检查Counter资源是否存在
        assert!(exists<Counter>(account_addr), E_NOT_INITIALIZED);
        
        // 获取Counter资源的可变引用
        let counter = borrow_global_mut<Counter>(account_addr);
        
        // 检查是否大于0
        if (counter.value > 0) {
            counter.value = counter.value - 1;
        }
    }
    
    /// 重置计数器的值
    public entry fun reset(account: &signer) acquires Counter {
        let account_addr = signer::address_of(account);
        
        // 检查Counter资源是否存在
        assert!(exists<Counter>(account_addr), E_NOT_INITIALIZED);
        
        // 获取Counter资源的可变引用
        let counter = borrow_global_mut<Counter>(account_addr);
        
        // 检查是否是所有者
        assert!(counter.owner == account_addr, E_NOT_OWNER);
        
        // 重置值
        counter.value = 0;
    }
    
    /// 读取计数器的值
    #[view]
    public fun get_count(addr: address): u64 acquires Counter {
        // 检查Counter资源是否存在
        assert!(exists<Counter>(addr), E_NOT_INITIALIZED);
        
        // 获取Counter资源的引用
        let counter = borrow_global<Counter>(addr);
        
        // 返回值
        counter.value
    }
} 