module proofme::resume {
    use std::string::String;
    use sui::table::{ Self, Table };
    use sui::event;

    /// Struct
    public struct ResumeManager has key {
        id: UID,
        resumes: Table<address, ID>
    }

    public struct Resume has key {
        id: UID,
        owner: address,
        name: String,
        date: String,
        education: String,
        mail: String,
        number: String,
        avatar: String,
        abilities: vector<String>,
        experiences: vector<Experiences>,
        achievements: vector<Achievement>,
    }

    public struct Experiences has store, drop {
        experience: String,
        verification: bool
    } 

    public struct Achievement has store, drop {
        achievement: String,
        verification: bool
    }
 
    /// Events
    public struct ManagerCreated has copy, drop {
        resume_manager: ID
    }

    public struct ResumeCreated has copy, drop {
        resume: ID,
        user: address,
        name: String, 
        date: String,
        education: String,
        mail: String, 
        number: String,
        avatar: String
    }

    public struct AbilityAdded has copy, drop {
        resume: ID,
        ability: String
    }

    public struct ExperienceAdded has copy, drop {
        resume: ID,
        experience: String,
        verification: bool
    }

    public struct AchievementAdded has copy, drop {
        resume: ID,
        achievement: String,
        verification: bool
    }

    fun init(ctx: &mut TxContext) {
        let resume_manager_uid = object::new(ctx);
        let id = object::uid_to_inner(&resume_manager_uid);

        let resume_manager = ResumeManager {
            id: resume_manager_uid,
            resumes: table::new(ctx)
        };

        event::emit( ManagerCreated {
            resume_manager: id
        });

        transfer::share_object(resume_manager);
    }

    public entry fun create_resume(
        resume_manager: &mut ResumeManager,
        name: String, 
        date: String, 
        education: String, 
        mail: String, 
        number: String, 
        avatar: String,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let resume_uid = object::new(ctx);
        let id = object::uid_to_inner(&resume_uid);

        let resume = Resume {
            id: resume_uid,
            owner: owner,
            name: name,
            date: date,
            education: education,
            mail: mail,
            number: number,
            avatar: avatar,
            abilities: vector::empty(),
            experiences: vector::empty(),
            achievements: vector::empty()
        };

        table::add(&mut resume_manager.resumes, owner, id);

        event::emit( ResumeCreated {
            resume: id,
            user: owner,
            name: name, 
            date: date,
            education: education,
            mail: mail, 
            number: number,
            avatar: avatar
        });

        transfer::transfer(resume, owner);

    }

    public entry fun add_ability(
        resume: &mut Resume, 
        ability: String,
        _: &mut TxContext
    ) {
        let resume_id = object::uid_to_inner(&resume.id);
        vector::push_back(&mut resume.abilities, ability);

        event::emit(AbilityAdded {
            resume: resume_id,
            ability: ability
        })
    }

    public entry fun add_experience(
        resume: &mut Resume, 
        experience: String,
        _: &mut TxContext
    ) {
        let resume_id = object::uid_to_inner(&resume.id);
        let exp = Experiences {
            experience: experience,
            verification: false
        };
        vector::push_back(&mut resume.experiences, exp);

        event::emit(ExperienceAdded {
            resume: resume_id,
            experience: experience,
            verification: false
        })
    }

    public entry fun add_achievement(
        resume: &mut Resume, 
        achievement: String,
        _: &mut TxContext
    ) {
        let resume_id = object::uid_to_inner(&resume.id);

        let achi = Achievement {
            achievement: achievement,
            verification: false
        };
        vector::push_back(&mut resume.achievements, achi);

        event::emit(AchievementAdded {
            resume: resume_id,
            achievement: achievement,
            verification: false
        })
    }

    // Revise ability
    public entry fun revise_ability(
        resume: &mut Resume,
        new_ability: String,
        index: u64,
        _: &mut TxContext
    ) {
        let ability = vector::borrow_mut(&mut resume.abilities, index);
        *ability = new_ability;
    }

    // Revise experience
    public entry fun revise_experience(
        resume: &mut Resume,
        new_experience: String,
        index: u64,
        _: &mut TxContext
    ) {
        let experience = vector::borrow_mut(&mut resume.experiences, index);
        *experience = Experiences {
            experience: new_experience,
            verification: false
        };
    }

    // Revise achievement
    public entry fun revise_achievement(
        resume: &mut Resume,
        new_achievement: String,
        index: u64,
        _: &mut TxContext
    ) {
        let achievement = vector::borrow_mut(&mut resume.achievements, index);
        *achievement = Achievement {
            achievement: new_achievement,
            verification: false
        };
    }

    

    #[test_only]
    use sui::test_scenario;

    #[test]
    public fun test_init() {
        let user1: address = @0x123; 
        let mut scenario = test_scenario::begin(user1);

        init(test_scenario::ctx(&mut scenario));
        test_scenario::next_epoch(&mut scenario, user1);

        test_scenario::end(scenario);
    }

}


