import * as $protobuf from "protobufjs";
import Long = require("long");

/** PB_Attr enum. */
export enum PB_Attr {

    /** ATTR_HEALTH value */
    ATTR_HEALTH = 0,

    /** ATTR_MAX_HEALTH value */
    ATTR_MAX_HEALTH = 1,

    /** ATTR_MANA value */
    ATTR_MANA = 2,

    /** ATTR_MAX_MANA value */
    ATTR_MAX_MANA = 3,

    /** ATTR_STRENGTH value */
    ATTR_STRENGTH = 4,

    /** ATTR_AGILITY value */
    ATTR_AGILITY = 5,

    /** ATTR_INTELLIGENCE value */
    ATTR_INTELLIGENCE = 6,

    /** ATTR_VITALITY value */
    ATTR_VITALITY = 7,

    /** ATTR_LUCK value */
    ATTR_LUCK = 8,

    /** ATTR_ARMOR value */
    ATTR_ARMOR = 9,

    /** ATTR_CRIT_CHANCE value */
    ATTR_CRIT_CHANCE = 10,

    /** ATTR_CRIT_DAMAGE value */
    ATTR_CRIT_DAMAGE = 11,

    /** ATTR_ATTACK_SPEED value */
    ATTR_ATTACK_SPEED = 12,

    /** ATTR_DODGE_CHANCE value */
    ATTR_DODGE_CHANCE = 13,

    /** ATTR_BLOCK_CHANCE value */
    ATTR_BLOCK_CHANCE = 14,

    /** ATTR_DAMAGE_MULTIPLIER value */
    ATTR_DAMAGE_MULTIPLIER = 15,

    /** ATTR_MAX value */
    ATTR_MAX = 16
}

/** BattleEventType enum. */
export enum BattleEventType {

    /** BATTLE_EVENT_TYPE_NONE value */
    BATTLE_EVENT_TYPE_NONE = 0,

    /** BATTLE_EVENT_TYPE_BATTLE value */
    BATTLE_EVENT_TYPE_BATTLE = 1,

    /** BATTLE_EVENT_TYPE_TURN value */
    BATTLE_EVENT_TYPE_TURN = 10,

    /** BATTLE_EVENT_TYPE_ABILITY_ACTIVATE value */
    BATTLE_EVENT_TYPE_ABILITY_ACTIVATE = 20,

    /** BATTLE_EVENT_TYPE_DAMAGE value */
    BATTLE_EVENT_TYPE_DAMAGE = 30,

    /** BATTLE_EVENT_TYPE_HEAL value */
    BATTLE_EVENT_TYPE_HEAL = 31,

    /** BATTLE_EVENT_TYPE_EFFECT_APPLIED value */
    BATTLE_EVENT_TYPE_EFFECT_APPLIED = 40,

    /** BATTLE_EVENT_TYPE_EFFECT_REMOVED value */
    BATTLE_EVENT_TYPE_EFFECT_REMOVED = 41,

    /** BATTLE_EVENT_TYPE_EFFECT_TICK value */
    BATTLE_EVENT_TYPE_EFFECT_TICK = 42,

    /** BATTLE_EVENT_TYPE_DEATH value */
    BATTLE_EVENT_TYPE_DEATH = 50,

    /** BATTLE_EVENT_TYPE_STATUS_CHANGE value */
    BATTLE_EVENT_TYPE_STATUS_CHANGE = 60,

    /** BATTLE_EVENT_TYPE_ATTR_CHANGE value */
    BATTLE_EVENT_TYPE_ATTR_CHANGE = 61,

    /** BATTLE_EVENT_TYPE_CUSTOM value */
    BATTLE_EVENT_TYPE_CUSTOM = 100
}

/** PB_BattleMode enum. */
export enum PB_BattleMode {

    /** BATTLE_MODE_NONE value */
    BATTLE_MODE_NONE = 0,

    /** BATTLE_MODE_TURN_BASED value */
    BATTLE_MODE_TURN_BASED = 1,

    /** BATTLE_MODE_REALTIME value */
    BATTLE_MODE_REALTIME = 2
}

/** PB_ObjType enum. */
export enum PB_ObjType {

    /** OBJ_TYPE_NONE value */
    OBJ_TYPE_NONE = 0,

    /** OBJ_TYPE_HERO value */
    OBJ_TYPE_HERO = 1,

    /** OBJ_TYPE_MONSTER value */
    OBJ_TYPE_MONSTER = 2
}

/** PB_BattlePhase enum. */
export enum PB_BattlePhase {

    /** BATTLE_PHASE_NONE value */
    BATTLE_PHASE_NONE = 0,

    /** BATTLE_PHASE_PREPARING value */
    BATTLE_PHASE_PREPARING = 1,

    /** BATTLE_PHASE_STARTED value */
    BATTLE_PHASE_STARTED = 2,

    /** BATTLE_PHASE_ENDING value */
    BATTLE_PHASE_ENDING = 3,

    /** BATTLE_PHASE_FINISHED value */
    BATTLE_PHASE_FINISHED = 4
}

/** PB_TeamSide enum. */
export enum PB_TeamSide {

    /** TEAM_SIDE_NONE value */
    TEAM_SIDE_NONE = 0,

    /** TEAM_SIDE_ATTACKER value */
    TEAM_SIDE_ATTACKER = 1,

    /** TEAM_SIDE_DEFENDER value */
    TEAM_SIDE_DEFENDER = 2,

    /** TEAM_SIDE_NEUTRAL value */
    TEAM_SIDE_NEUTRAL = 3
}

/** PB_VictoryCondition enum. */
export enum PB_VictoryCondition {

    /** VICTORY_COND_NONE value */
    VICTORY_COND_NONE = 0,

    /** VICTORY_COND_DEFENDER_DEATH value */
    VICTORY_COND_DEFENDER_DEATH = 1,

    /** VICTORY_COND_ATTACKER_DEATH value */
    VICTORY_COND_ATTACKER_DEATH = 2,

    /** VICTORY_COND_ELIMINATE_ALL value */
    VICTORY_COND_ELIMINATE_ALL = 3,

    /** VICTORY_COND_SURVIVE_TIME value */
    VICTORY_COND_SURVIVE_TIME = 4,

    /** VICTORY_COND_KILL_TARGET value */
    VICTORY_COND_KILL_TARGET = 5,

    /** VICTORY_COND_SCORE_LIMIT value */
    VICTORY_COND_SCORE_LIMIT = 6,

    /** VICTORY_COND_CUSTOM value */
    VICTORY_COND_CUSTOM = 99
}

/** PB_BattleResultType enum. */
export enum PB_BattleResultType {

    /** BATTLE_RESULT_NONE value */
    BATTLE_RESULT_NONE = 0,

    /** BATTLE_RESULT_VICTORY value */
    BATTLE_RESULT_VICTORY = 1,

    /** BATTLE_RESULT_DEFEAT value */
    BATTLE_RESULT_DEFEAT = 2,

    /** BATTLE_RESULT_TIME_OUT value */
    BATTLE_RESULT_TIME_OUT = 3,

    /** BATTLE_RESULT_DRAW value */
    BATTLE_RESULT_DRAW = 4,

    /** BATTLE_RESULT_CANCELLED value */
    BATTLE_RESULT_CANCELLED = 5
}

/** PB_AbilityTargetType enum. */
export enum PB_AbilityTargetType {

    /** ABILITY_TARGET_NONE value */
    ABILITY_TARGET_NONE = 0,

    /** ABILITY_TARGET_SELF value */
    ABILITY_TARGET_SELF = 1,

    /** ABILITY_TARGET_ENEMY_SINGLE value */
    ABILITY_TARGET_ENEMY_SINGLE = 2,

    /** ABILITY_TARGET_FRIEND_SINGLE value */
    ABILITY_TARGET_FRIEND_SINGLE = 3,

    /** ABILITY_TARGET_ENEMY_AOE value */
    ABILITY_TARGET_ENEMY_AOE = 4,

    /** ABILITY_TARGET_FRIEND_AOE value */
    ABILITY_TARGET_FRIEND_AOE = 5,

    /** ABILITY_TARGET_ALL value */
    ABILITY_TARGET_ALL = 6,

    /** ABILITY_TARGET_LOCATION_AOE value */
    ABILITY_TARGET_LOCATION_AOE = 7
}

/** PB_AbilityType enum. */
export enum PB_AbilityType {

    /** ABILITY_TYPE_NONE value */
    ABILITY_TYPE_NONE = 0,

    /** ABILITY_TYPE_PHYSICAL_ATTACK value */
    ABILITY_TYPE_PHYSICAL_ATTACK = 1,

    /** ABILITY_TYPE_MAGIC_ATTACK value */
    ABILITY_TYPE_MAGIC_ATTACK = 2,

    /** ABILITY_TYPE_LIFESTEAL_ATTACK value */
    ABILITY_TYPE_LIFESTEAL_ATTACK = 3,

    /** ABILITY_TYPE_HEAL value */
    ABILITY_TYPE_HEAL = 4,

    /** ABILITY_TYPE_SELF_BUFF value */
    ABILITY_TYPE_SELF_BUFF = 5,

    /** ABILITY_TYPE_TARGET_BUFF value */
    ABILITY_TYPE_TARGET_BUFF = 6,

    /** ABILITY_TYPE_MAGIC_ATTACK_WITH_BUFF value */
    ABILITY_TYPE_MAGIC_ATTACK_WITH_BUFF = 7,

    /** ABILITY_TYPE_CUSTOM value */
    ABILITY_TYPE_CUSTOM = 99
}

/** PB_DamageType enum. */
export enum PB_DamageType {

    /** DAMAGE_TYPE_NONE value */
    DAMAGE_TYPE_NONE = 0,

    /** DAMAGE_TYPE_ATTACK value */
    DAMAGE_TYPE_ATTACK = 1,

    /** DAMAGE_TYPE_SKILL value */
    DAMAGE_TYPE_SKILL = 2,

    /** DAMAGE_TYPE_BUFF value */
    DAMAGE_TYPE_BUFF = 3
}

/** PB_DurationPolicy enum. */
export enum PB_DurationPolicy {

    /** DURATION_POLICY_NONE value */
    DURATION_POLICY_NONE = 0,

    /** DURATION_POLICY_INSTANT value */
    DURATION_POLICY_INSTANT = 1,

    /** DURATION_POLICY_DURATION value */
    DURATION_POLICY_DURATION = 2,

    /** DURATION_POLICY_INFINITE value */
    DURATION_POLICY_INFINITE = 3
}

/** PB_StackingPolicy enum. */
export enum PB_StackingPolicy {

    /** STACKING_POLICY_NONE value */
    STACKING_POLICY_NONE = 0,

    /** STACKING_POLICY_AGGREGATE_BY_SOURCE value */
    STACKING_POLICY_AGGREGATE_BY_SOURCE = 1,

    /** STACKING_POLICY_AGGREGATE_BY_TARGET value */
    STACKING_POLICY_AGGREGATE_BY_TARGET = 2
}

/** PB_StackDurationRefreshPolicy enum. */
export enum PB_StackDurationRefreshPolicy {

    /** STACK_DURATION_REFRESH_POLICY_NONE value */
    STACK_DURATION_REFRESH_POLICY_NONE = 0,

    /** STACK_DURATION_REFRESH_POLICY_REFRESH_ON_APPLICATION value */
    STACK_DURATION_REFRESH_POLICY_REFRESH_ON_APPLICATION = 1,

    /** STACK_DURATION_REFRESH_POLICY_NEVER_REFRESH value */
    STACK_DURATION_REFRESH_POLICY_NEVER_REFRESH = 2,

    /** STACK_DURATION_REFRESH_POLICY_REFRESH_ON_MAX_STACK value */
    STACK_DURATION_REFRESH_POLICY_REFRESH_ON_MAX_STACK = 3
}

/** PB_PeriodicPolicy enum. */
export enum PB_PeriodicPolicy {

    /** PERIODIC_POLICY_NONE value */
    PERIODIC_POLICY_NONE = 0,

    /** PERIODIC_POLICY_EXECUTE_ON_APPLICATION value */
    PERIODIC_POLICY_EXECUTE_ON_APPLICATION = 1,

    /** PERIODIC_POLICY_EXECUTE_ON_INTERVAL value */
    PERIODIC_POLICY_EXECUTE_ON_INTERVAL = 2
}

/** PB_ModifierOperation enum. */
export enum PB_ModifierOperation {

    /** MODIFIER_OPERATION_NONE value */
    MODIFIER_OPERATION_NONE = 0,

    /** MODIFIER_OPERATION_ADD value */
    MODIFIER_OPERATION_ADD = 1,

    /** MODIFIER_OPERATION_MULTIPLY value */
    MODIFIER_OPERATION_MULTIPLY = 2,

    /** MODIFIER_OPERATION_OVERRIDE value */
    MODIFIER_OPERATION_OVERRIDE = 3
}

/** PB_AbilityActivationPolicy enum. */
export enum PB_AbilityActivationPolicy {

    /** ABILITY_ACTIVATION_POLICY_NONE value */
    ABILITY_ACTIVATION_POLICY_NONE = 0,

    /** ABILITY_ACTIVATION_POLICY_ON_INPUT_TRIGGERED value */
    ABILITY_ACTIVATION_POLICY_ON_INPUT_TRIGGERED = 1,

    /** ABILITY_ACTIVATION_POLICY_WHILE_INPUT_ACTIVE value */
    ABILITY_ACTIVATION_POLICY_WHILE_INPUT_ACTIVE = 2,

    /** ABILITY_ACTIVATION_POLICY_ON_SPAWN value */
    ABILITY_ACTIVATION_POLICY_ON_SPAWN = 3
}

/** PB_AbilityNetPolicy enum. */
export enum PB_AbilityNetPolicy {

    /** ABILITY_NET_POLICY_NONE value */
    ABILITY_NET_POLICY_NONE = 0,

    /** ABILITY_NET_POLICY_LOCAL_PREDICTED value */
    ABILITY_NET_POLICY_LOCAL_PREDICTED = 1,

    /** ABILITY_NET_POLICY_LOCAL_ONLY value */
    ABILITY_NET_POLICY_LOCAL_ONLY = 2,

    /** ABILITY_NET_POLICY_SERVER_INITIATED value */
    ABILITY_NET_POLICY_SERVER_INITIATED = 3,

    /** ABILITY_NET_POLICY_SERVER_ONLY value */
    ABILITY_NET_POLICY_SERVER_ONLY = 4
}

/** PB_CancelAbilityPolicy enum. */
export enum PB_CancelAbilityPolicy {

    /** CANCEL_ABILITY_POLICY_NONE value */
    CANCEL_ABILITY_POLICY_NONE = 0,

    /** CANCEL_ABILITY_POLICY_CANCEL_ABILITY value */
    CANCEL_ABILITY_POLICY_CANCEL_ABILITY = 1,

    /** CANCEL_ABILITY_POLICY_IGNORE_ABILITY value */
    CANCEL_ABILITY_POLICY_IGNORE_ABILITY = 2
}

/**
 * Properties of a PB_AbilitySpec.
 * @deprecated Use PB_AbilitySpec.$Properties instead.
 */
export interface IPB_AbilitySpec extends PB_AbilitySpec.$Properties {
}

/** Represents a PB_AbilitySpec. */
export class PB_AbilitySpec {

    /**
     * Constructs a new PB_AbilitySpec.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_AbilitySpec.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_AbilitySpec ability_id. */
    ability_id?: (number|null);

    /** PB_AbilitySpec level. */
    level?: (number|null);

    /**
     * Creates a new PB_AbilitySpec instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_AbilitySpec instance
     */
    static create(properties: PB_AbilitySpec.$Shape): PB_AbilitySpec & PB_AbilitySpec.$Shape;
    static create(properties?: PB_AbilitySpec.$Properties): PB_AbilitySpec;

    /**
     * Encodes the specified PB_AbilitySpec message. Does not implicitly {@link PB_AbilitySpec.verify|verify} messages.
     * @param message PB_AbilitySpec message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_AbilitySpec.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_AbilitySpec message, length delimited. Does not implicitly {@link PB_AbilitySpec.verify|verify} messages.
     * @param message PB_AbilitySpec message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_AbilitySpec.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_AbilitySpec message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_AbilitySpec & PB_AbilitySpec.$Shape} PB_AbilitySpec
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_AbilitySpec & PB_AbilitySpec.$Shape;

    /**
     * Decodes a PB_AbilitySpec message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_AbilitySpec & PB_AbilitySpec.$Shape} PB_AbilitySpec
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_AbilitySpec & PB_AbilitySpec.$Shape;

    /**
     * Verifies a PB_AbilitySpec message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_AbilitySpec message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_AbilitySpec
     */
    static fromObject(object: { [k: string]: any }): PB_AbilitySpec;

    /**
     * Creates a plain object from a PB_AbilitySpec message. Also converts values to other types if specified.
     * @param message PB_AbilitySpec
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_AbilitySpec, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_AbilitySpec to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_AbilitySpec
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_AbilitySpec {

    /** Properties of a PB_AbilitySpec. */
    interface $Properties {

        /** PB_AbilitySpec ability_id */
        ability_id?: (number|null);

        /** PB_AbilitySpec level */
        level?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_AbilitySpec. */
    type $Shape = PB_AbilitySpec.$Properties;
}

/**
 * Properties of a PB_BattleParticipant.
 * @deprecated Use PB_BattleParticipant.$Properties instead.
 */
export interface IPB_BattleParticipant extends PB_BattleParticipant.$Properties {
}

/** Represents a PB_BattleParticipant. */
export class PB_BattleParticipant {

    /**
     * Constructs a new PB_BattleParticipant.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleParticipant.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleParticipant obj_id. */
    obj_id?: (number|null);

    /** PB_BattleParticipant obj_type. */
    obj_type?: (PB_ObjType|null);

    /** PB_BattleParticipant name. */
    name?: (string|null);

    /** PB_BattleParticipant level. */
    level?: (number|null);

    /** PB_BattleParticipant attrs. */
    attrs: PB_AttrPair.$Properties[];

    /** PB_BattleParticipant abilities. */
    abilities: PB_AbilitySpec.$Properties[];

    /** PB_BattleParticipant tags. */
    tags: string[];

    /**
     * Creates a new PB_BattleParticipant instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleParticipant instance
     */
    static create(properties: PB_BattleParticipant.$Shape): PB_BattleParticipant & PB_BattleParticipant.$Shape;
    static create(properties?: PB_BattleParticipant.$Properties): PB_BattleParticipant;

    /**
     * Encodes the specified PB_BattleParticipant message. Does not implicitly {@link PB_BattleParticipant.verify|verify} messages.
     * @param message PB_BattleParticipant message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleParticipant.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleParticipant message, length delimited. Does not implicitly {@link PB_BattleParticipant.verify|verify} messages.
     * @param message PB_BattleParticipant message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleParticipant.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleParticipant message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleParticipant & PB_BattleParticipant.$Shape} PB_BattleParticipant
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleParticipant & PB_BattleParticipant.$Shape;

    /**
     * Decodes a PB_BattleParticipant message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleParticipant & PB_BattleParticipant.$Shape} PB_BattleParticipant
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleParticipant & PB_BattleParticipant.$Shape;

    /**
     * Verifies a PB_BattleParticipant message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleParticipant message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleParticipant
     */
    static fromObject(object: { [k: string]: any }): PB_BattleParticipant;

    /**
     * Creates a plain object from a PB_BattleParticipant message. Also converts values to other types if specified.
     * @param message PB_BattleParticipant
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleParticipant, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleParticipant to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleParticipant
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleParticipant {

    /** Properties of a PB_BattleParticipant. */
    interface $Properties {

        /** PB_BattleParticipant obj_id */
        obj_id?: (number|null);

        /** PB_BattleParticipant obj_type */
        obj_type?: (PB_ObjType|null);

        /** PB_BattleParticipant name */
        name?: (string|null);

        /** PB_BattleParticipant level */
        level?: (number|null);

        /** PB_BattleParticipant attrs */
        attrs?: (PB_AttrPair.$Properties[]|null);

        /** PB_BattleParticipant abilities */
        abilities?: (PB_AbilitySpec.$Properties[]|null);

        /** PB_BattleParticipant tags */
        tags?: (string[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleParticipant. */
    type $Shape = PB_BattleParticipant.$Properties;
}

/**
 * Properties of a PB_BattleTeam.
 * @deprecated Use PB_BattleTeam.$Properties instead.
 */
export interface IPB_BattleTeam extends PB_BattleTeam.$Properties {
}

/** Represents a PB_BattleTeam. */
export class PB_BattleTeam {

    /**
     * Constructs a new PB_BattleTeam.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleTeam.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleTeam team_id. */
    team_id?: (number|null);

    /** PB_BattleTeam team_name. */
    team_name?: (string|null);

    /** PB_BattleTeam side. */
    side?: (PB_TeamSide|null);

    /** PB_BattleTeam members. */
    members: PB_BattleParticipant.$Properties[];

    /**
     * Creates a new PB_BattleTeam instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleTeam instance
     */
    static create(properties: PB_BattleTeam.$Shape): PB_BattleTeam & PB_BattleTeam.$Shape;
    static create(properties?: PB_BattleTeam.$Properties): PB_BattleTeam;

    /**
     * Encodes the specified PB_BattleTeam message. Does not implicitly {@link PB_BattleTeam.verify|verify} messages.
     * @param message PB_BattleTeam message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleTeam.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleTeam message, length delimited. Does not implicitly {@link PB_BattleTeam.verify|verify} messages.
     * @param message PB_BattleTeam message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleTeam.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleTeam message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleTeam & PB_BattleTeam.$Shape} PB_BattleTeam
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleTeam & PB_BattleTeam.$Shape;

    /**
     * Decodes a PB_BattleTeam message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleTeam & PB_BattleTeam.$Shape} PB_BattleTeam
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleTeam & PB_BattleTeam.$Shape;

    /**
     * Verifies a PB_BattleTeam message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleTeam message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleTeam
     */
    static fromObject(object: { [k: string]: any }): PB_BattleTeam;

    /**
     * Creates a plain object from a PB_BattleTeam message. Also converts values to other types if specified.
     * @param message PB_BattleTeam
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleTeam, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleTeam to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleTeam
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleTeam {

    /** Properties of a PB_BattleTeam. */
    interface $Properties {

        /** PB_BattleTeam team_id */
        team_id?: (number|null);

        /** PB_BattleTeam team_name */
        team_name?: (string|null);

        /** PB_BattleTeam side */
        side?: (PB_TeamSide|null);

        /** PB_BattleTeam members */
        members?: (PB_BattleParticipant.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleTeam. */
    type $Shape = PB_BattleTeam.$Properties;
}

/**
 * Properties of a PB_BattleRules.
 * @deprecated Use PB_BattleRules.$Properties instead.
 */
export interface IPB_BattleRules extends PB_BattleRules.$Properties {
}

/** Represents a PB_BattleRules. */
export class PB_BattleRules {

    /**
     * Constructs a new PB_BattleRules.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleRules.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleRules victory_condition. */
    victory_condition?: (PB_VictoryCondition|null);

    /** PB_BattleRules max_turns. */
    max_turns?: (number|null);

    /** PB_BattleRules max_duration_sec. */
    max_duration_sec?: (number|null);

    /** PB_BattleRules allow_flee. */
    allow_flee?: (boolean|null);

    /** PB_BattleRules score_limit. */
    score_limit?: (number|null);

    /** PB_BattleRules target_member_id. */
    target_member_id?: (number|null);

    /**
     * Creates a new PB_BattleRules instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleRules instance
     */
    static create(properties: PB_BattleRules.$Shape): PB_BattleRules & PB_BattleRules.$Shape;
    static create(properties?: PB_BattleRules.$Properties): PB_BattleRules;

    /**
     * Encodes the specified PB_BattleRules message. Does not implicitly {@link PB_BattleRules.verify|verify} messages.
     * @param message PB_BattleRules message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleRules.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleRules message, length delimited. Does not implicitly {@link PB_BattleRules.verify|verify} messages.
     * @param message PB_BattleRules message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleRules.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleRules message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleRules & PB_BattleRules.$Shape} PB_BattleRules
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleRules & PB_BattleRules.$Shape;

    /**
     * Decodes a PB_BattleRules message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleRules & PB_BattleRules.$Shape} PB_BattleRules
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleRules & PB_BattleRules.$Shape;

    /**
     * Verifies a PB_BattleRules message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleRules message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleRules
     */
    static fromObject(object: { [k: string]: any }): PB_BattleRules;

    /**
     * Creates a plain object from a PB_BattleRules message. Also converts values to other types if specified.
     * @param message PB_BattleRules
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleRules, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleRules to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleRules
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleRules {

    /** Properties of a PB_BattleRules. */
    interface $Properties {

        /** PB_BattleRules victory_condition */
        victory_condition?: (PB_VictoryCondition|null);

        /** PB_BattleRules max_turns */
        max_turns?: (number|null);

        /** PB_BattleRules max_duration_sec */
        max_duration_sec?: (number|null);

        /** PB_BattleRules allow_flee */
        allow_flee?: (boolean|null);

        /** PB_BattleRules score_limit */
        score_limit?: (number|null);

        /** PB_BattleRules target_member_id */
        target_member_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleRules. */
    type $Shape = PB_BattleRules.$Properties;
}

/**
 * Properties of a PB_BattleReq.
 * @deprecated Use PB_BattleReq.$Properties instead.
 */
export interface IPB_BattleReq extends PB_BattleReq.$Properties {
}

/** Represents a PB_BattleReq. */
export class PB_BattleReq {

    /**
     * Constructs a new PB_BattleReq.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleReq.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleReq battle_id. */
    battle_id?: (number|null);

    /** PB_BattleReq mode. */
    mode?: (PB_BattleMode|null);

    /** PB_BattleReq battle_type. */
    battle_type?: (number|null);

    /** PB_BattleReq target_id. */
    target_id?: (number|null);

    /** PB_BattleReq random_seed. */
    random_seed?: (number|null);

    /** PB_BattleReq rules. */
    rules?: (PB_BattleRules.$Properties|null);

    /** PB_BattleReq teams. */
    teams: PB_BattleTeam.$Properties[];

    /**
     * Creates a new PB_BattleReq instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleReq instance
     */
    static create(properties: PB_BattleReq.$Shape): PB_BattleReq & PB_BattleReq.$Shape;
    static create(properties?: PB_BattleReq.$Properties): PB_BattleReq;

    /**
     * Encodes the specified PB_BattleReq message. Does not implicitly {@link PB_BattleReq.verify|verify} messages.
     * @param message PB_BattleReq message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleReq.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleReq message, length delimited. Does not implicitly {@link PB_BattleReq.verify|verify} messages.
     * @param message PB_BattleReq message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleReq.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleReq message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleReq & PB_BattleReq.$Shape} PB_BattleReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleReq & PB_BattleReq.$Shape;

    /**
     * Decodes a PB_BattleReq message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleReq & PB_BattleReq.$Shape} PB_BattleReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleReq & PB_BattleReq.$Shape;

    /**
     * Verifies a PB_BattleReq message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleReq message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleReq
     */
    static fromObject(object: { [k: string]: any }): PB_BattleReq;

    /**
     * Creates a plain object from a PB_BattleReq message. Also converts values to other types if specified.
     * @param message PB_BattleReq
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleReq, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleReq to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleReq
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleReq {

    /** Properties of a PB_BattleReq. */
    interface $Properties {

        /** PB_BattleReq battle_id */
        battle_id?: (number|null);

        /** PB_BattleReq mode */
        mode?: (PB_BattleMode|null);

        /** PB_BattleReq battle_type */
        battle_type?: (number|null);

        /** PB_BattleReq target_id */
        target_id?: (number|null);

        /** PB_BattleReq random_seed */
        random_seed?: (number|null);

        /** PB_BattleReq rules */
        rules?: (PB_BattleRules.$Properties|null);

        /** PB_BattleReq teams */
        teams?: (PB_BattleTeam.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleReq. */
    type $Shape = PB_BattleReq.$Properties;
}

/**
 * Properties of a PB_BattleEntityState.
 * @deprecated Use PB_BattleEntityState.$Properties instead.
 */
export interface IPB_BattleEntityState extends PB_BattleEntityState.$Properties {
}

/** Represents a PB_BattleEntityState. */
export class PB_BattleEntityState {

    /**
     * Constructs a new PB_BattleEntityState.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleEntityState.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleEntityState pid. */
    pid?: (number|null);

    /** PB_BattleEntityState obj_id. */
    obj_id?: (number|null);

    /** PB_BattleEntityState obj_type. */
    obj_type?: (PB_ObjType|null);

    /** PB_BattleEntityState name. */
    name?: (string|null);

    /** PB_BattleEntityState level. */
    level?: (number|null);

    /** PB_BattleEntityState team_id. */
    team_id?: (number|null);

    /** PB_BattleEntityState alive. */
    alive?: (boolean|null);

    /** PB_BattleEntityState attrs. */
    attrs: PB_AttrPair.$Properties[];

    /**
     * Creates a new PB_BattleEntityState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleEntityState instance
     */
    static create(properties: PB_BattleEntityState.$Shape): PB_BattleEntityState & PB_BattleEntityState.$Shape;
    static create(properties?: PB_BattleEntityState.$Properties): PB_BattleEntityState;

    /**
     * Encodes the specified PB_BattleEntityState message. Does not implicitly {@link PB_BattleEntityState.verify|verify} messages.
     * @param message PB_BattleEntityState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleEntityState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleEntityState message, length delimited. Does not implicitly {@link PB_BattleEntityState.verify|verify} messages.
     * @param message PB_BattleEntityState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleEntityState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleEntityState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleEntityState & PB_BattleEntityState.$Shape} PB_BattleEntityState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleEntityState & PB_BattleEntityState.$Shape;

    /**
     * Decodes a PB_BattleEntityState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleEntityState & PB_BattleEntityState.$Shape} PB_BattleEntityState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleEntityState & PB_BattleEntityState.$Shape;

    /**
     * Verifies a PB_BattleEntityState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleEntityState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleEntityState
     */
    static fromObject(object: { [k: string]: any }): PB_BattleEntityState;

    /**
     * Creates a plain object from a PB_BattleEntityState message. Also converts values to other types if specified.
     * @param message PB_BattleEntityState
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleEntityState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleEntityState to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleEntityState
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleEntityState {

    /** Properties of a PB_BattleEntityState. */
    interface $Properties {

        /** PB_BattleEntityState pid */
        pid?: (number|null);

        /** PB_BattleEntityState obj_id */
        obj_id?: (number|null);

        /** PB_BattleEntityState obj_type */
        obj_type?: (PB_ObjType|null);

        /** PB_BattleEntityState name */
        name?: (string|null);

        /** PB_BattleEntityState level */
        level?: (number|null);

        /** PB_BattleEntityState team_id */
        team_id?: (number|null);

        /** PB_BattleEntityState alive */
        alive?: (boolean|null);

        /** PB_BattleEntityState attrs */
        attrs?: (PB_AttrPair.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleEntityState. */
    type $Shape = PB_BattleEntityState.$Properties;
}

/**
 * Properties of a PB_BattleResult.
 * @deprecated Use PB_BattleResult.$Properties instead.
 */
export interface IPB_BattleResult extends PB_BattleResult.$Properties {
}

/** Represents a PB_BattleResult. */
export class PB_BattleResult {

    /**
     * Constructs a new PB_BattleResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleResult.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleResult battle_id. */
    battle_id?: (number|null);

    /** PB_BattleResult result_type. */
    result_type?: (PB_BattleResultType|null);

    /** PB_BattleResult winner_team_id. */
    winner_team_id?: (number|null);

    /** PB_BattleResult total_turns. */
    total_turns?: (number|null);

    /** PB_BattleResult duration_ms. */
    duration_ms?: (number|null);

    /** PB_BattleResult replay_text. */
    replay_text?: (string|null);

    /** PB_BattleResult report_key. */
    report_key?: (string|null);

    /** PB_BattleResult final_states. */
    final_states: PB_BattleEntityState.$Properties[];

    /**
     * Creates a new PB_BattleResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleResult instance
     */
    static create(properties: PB_BattleResult.$Shape): PB_BattleResult & PB_BattleResult.$Shape;
    static create(properties?: PB_BattleResult.$Properties): PB_BattleResult;

    /**
     * Encodes the specified PB_BattleResult message. Does not implicitly {@link PB_BattleResult.verify|verify} messages.
     * @param message PB_BattleResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleResult message, length delimited. Does not implicitly {@link PB_BattleResult.verify|verify} messages.
     * @param message PB_BattleResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleResult & PB_BattleResult.$Shape} PB_BattleResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleResult & PB_BattleResult.$Shape;

    /**
     * Decodes a PB_BattleResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleResult & PB_BattleResult.$Shape} PB_BattleResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleResult & PB_BattleResult.$Shape;

    /**
     * Verifies a PB_BattleResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleResult
     */
    static fromObject(object: { [k: string]: any }): PB_BattleResult;

    /**
     * Creates a plain object from a PB_BattleResult message. Also converts values to other types if specified.
     * @param message PB_BattleResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleResult to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleResult
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleResult {

    /** Properties of a PB_BattleResult. */
    interface $Properties {

        /** PB_BattleResult battle_id */
        battle_id?: (number|null);

        /** PB_BattleResult result_type */
        result_type?: (PB_BattleResultType|null);

        /** PB_BattleResult winner_team_id */
        winner_team_id?: (number|null);

        /** PB_BattleResult total_turns */
        total_turns?: (number|null);

        /** PB_BattleResult duration_ms */
        duration_ms?: (number|null);

        /** PB_BattleResult replay_text */
        replay_text?: (string|null);

        /** PB_BattleResult report_key */
        report_key?: (string|null);

        /** PB_BattleResult final_states */
        final_states?: (PB_BattleEntityState.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleResult. */
    type $Shape = PB_BattleResult.$Properties;
}

/**
 * Properties of a PB_BattleMatchResult.
 * @deprecated Use PB_BattleMatchResult.$Properties instead.
 */
export interface IPB_BattleMatchResult extends PB_BattleMatchResult.$Properties {
}

/** Represents a PB_BattleMatchResult. */
export class PB_BattleMatchResult {

    /**
     * Constructs a new PB_BattleMatchResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleMatchResult.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleMatchResult match_index. */
    match_index?: (number|null);

    /** PB_BattleMatchResult result_type. */
    result_type?: (PB_BattleResultType|null);

    /** PB_BattleMatchResult battle_type. */
    battle_type?: (number|null);

    /** PB_BattleMatchResult report_key. */
    report_key?: (string|null);

    /** PB_BattleMatchResult replay_text. */
    replay_text?: (string|null);

    /**
     * Creates a new PB_BattleMatchResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleMatchResult instance
     */
    static create(properties: PB_BattleMatchResult.$Shape): PB_BattleMatchResult & PB_BattleMatchResult.$Shape;
    static create(properties?: PB_BattleMatchResult.$Properties): PB_BattleMatchResult;

    /**
     * Encodes the specified PB_BattleMatchResult message. Does not implicitly {@link PB_BattleMatchResult.verify|verify} messages.
     * @param message PB_BattleMatchResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleMatchResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleMatchResult message, length delimited. Does not implicitly {@link PB_BattleMatchResult.verify|verify} messages.
     * @param message PB_BattleMatchResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleMatchResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleMatchResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleMatchResult & PB_BattleMatchResult.$Shape} PB_BattleMatchResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleMatchResult & PB_BattleMatchResult.$Shape;

    /**
     * Decodes a PB_BattleMatchResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleMatchResult & PB_BattleMatchResult.$Shape} PB_BattleMatchResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleMatchResult & PB_BattleMatchResult.$Shape;

    /**
     * Verifies a PB_BattleMatchResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleMatchResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleMatchResult
     */
    static fromObject(object: { [k: string]: any }): PB_BattleMatchResult;

    /**
     * Creates a plain object from a PB_BattleMatchResult message. Also converts values to other types if specified.
     * @param message PB_BattleMatchResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleMatchResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleMatchResult to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleMatchResult
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleMatchResult {

    /** Properties of a PB_BattleMatchResult. */
    interface $Properties {

        /** PB_BattleMatchResult match_index */
        match_index?: (number|null);

        /** PB_BattleMatchResult result_type */
        result_type?: (PB_BattleResultType|null);

        /** PB_BattleMatchResult battle_type */
        battle_type?: (number|null);

        /** PB_BattleMatchResult report_key */
        report_key?: (string|null);

        /** PB_BattleMatchResult replay_text */
        replay_text?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleMatchResult. */
    type $Shape = PB_BattleMatchResult.$Properties;
}

/**
 * Properties of a PB_BattleExecuteReq.
 * @deprecated Use PB_BattleExecuteReq.$Properties instead.
 */
export interface IPB_BattleExecuteReq extends PB_BattleExecuteReq.$Properties {
}

/** Represents a PB_BattleExecuteReq. */
export class PB_BattleExecuteReq {

    /**
     * Constructs a new PB_BattleExecuteReq.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_BattleExecuteReq.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_BattleExecuteReq battle_req. */
    battle_req?: (PB_BattleReq.$Properties|null);

    /** PB_BattleExecuteReq report_key. */
    report_key?: (string|null);

    /** PB_BattleExecuteReq uid. */
    uid?: (number|null);

    /** PB_BattleExecuteReq match_index. */
    match_index?: (number|null);

    /** PB_BattleExecuteReq total_matches. */
    total_matches?: (number|null);

    /**
     * Creates a new PB_BattleExecuteReq instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_BattleExecuteReq instance
     */
    static create(properties: PB_BattleExecuteReq.$Shape): PB_BattleExecuteReq & PB_BattleExecuteReq.$Shape;
    static create(properties?: PB_BattleExecuteReq.$Properties): PB_BattleExecuteReq;

    /**
     * Encodes the specified PB_BattleExecuteReq message. Does not implicitly {@link PB_BattleExecuteReq.verify|verify} messages.
     * @param message PB_BattleExecuteReq message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_BattleExecuteReq.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_BattleExecuteReq message, length delimited. Does not implicitly {@link PB_BattleExecuteReq.verify|verify} messages.
     * @param message PB_BattleExecuteReq message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_BattleExecuteReq.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_BattleExecuteReq message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_BattleExecuteReq & PB_BattleExecuteReq.$Shape} PB_BattleExecuteReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_BattleExecuteReq & PB_BattleExecuteReq.$Shape;

    /**
     * Decodes a PB_BattleExecuteReq message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_BattleExecuteReq & PB_BattleExecuteReq.$Shape} PB_BattleExecuteReq
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_BattleExecuteReq & PB_BattleExecuteReq.$Shape;

    /**
     * Verifies a PB_BattleExecuteReq message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_BattleExecuteReq message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_BattleExecuteReq
     */
    static fromObject(object: { [k: string]: any }): PB_BattleExecuteReq;

    /**
     * Creates a plain object from a PB_BattleExecuteReq message. Also converts values to other types if specified.
     * @param message PB_BattleExecuteReq
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_BattleExecuteReq, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_BattleExecuteReq to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_BattleExecuteReq
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_BattleExecuteReq {

    /** Properties of a PB_BattleExecuteReq. */
    interface $Properties {

        /** PB_BattleExecuteReq battle_req */
        battle_req?: (PB_BattleReq.$Properties|null);

        /** PB_BattleExecuteReq report_key */
        report_key?: (string|null);

        /** PB_BattleExecuteReq uid */
        uid?: (number|null);

        /** PB_BattleExecuteReq match_index */
        match_index?: (number|null);

        /** PB_BattleExecuteReq total_matches */
        total_matches?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_BattleExecuteReq. */
    type $Shape = PB_BattleExecuteReq.$Properties;
}

/**
 * Properties of a PB_ActivityState.
 * @deprecated Use PB_ActivityState.$Properties instead.
 */
export interface IPB_ActivityState extends PB_ActivityState.$Properties {
}

/** Represents a PB_ActivityState. */
export class PB_ActivityState {

    /**
     * Constructs a new PB_ActivityState.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ActivityState.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ActivityState server_id. */
    server_id?: (number|null);

    /** PB_ActivityState config_id. */
    config_id?: (number|null);

    /** PB_ActivityState activity_id. */
    activity_id?: (number|null);

    /** PB_ActivityState state. */
    state?: (number|null);

    /** PB_ActivityState state_begin_time. */
    state_begin_time?: (number|null);

    /** PB_ActivityState start_time. */
    start_time?: (number|null);

    /** PB_ActivityState end_time. */
    end_time?: (number|null);

    /** PB_ActivityState round. */
    round?: (number|null);

    /** PB_ActivityState last_window_end. */
    last_window_end?: (number|null);

    /** PB_ActivityState update_time. */
    update_time?: (number|null);

    /**
     * Creates a new PB_ActivityState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ActivityState instance
     */
    static create(properties: PB_ActivityState.$Shape): PB_ActivityState & PB_ActivityState.$Shape;
    static create(properties?: PB_ActivityState.$Properties): PB_ActivityState;

    /**
     * Encodes the specified PB_ActivityState message. Does not implicitly {@link PB_ActivityState.verify|verify} messages.
     * @param message PB_ActivityState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ActivityState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ActivityState message, length delimited. Does not implicitly {@link PB_ActivityState.verify|verify} messages.
     * @param message PB_ActivityState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ActivityState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ActivityState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ActivityState & PB_ActivityState.$Shape} PB_ActivityState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ActivityState & PB_ActivityState.$Shape;

    /**
     * Decodes a PB_ActivityState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ActivityState & PB_ActivityState.$Shape} PB_ActivityState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ActivityState & PB_ActivityState.$Shape;

    /**
     * Verifies a PB_ActivityState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ActivityState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ActivityState
     */
    static fromObject(object: { [k: string]: any }): PB_ActivityState;

    /**
     * Creates a plain object from a PB_ActivityState message. Also converts values to other types if specified.
     * @param message PB_ActivityState
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ActivityState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ActivityState to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ActivityState
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ActivityState {

    /** Properties of a PB_ActivityState. */
    interface $Properties {

        /** PB_ActivityState server_id */
        server_id?: (number|null);

        /** PB_ActivityState config_id */
        config_id?: (number|null);

        /** PB_ActivityState activity_id */
        activity_id?: (number|null);

        /** PB_ActivityState state */
        state?: (number|null);

        /** PB_ActivityState state_begin_time */
        state_begin_time?: (number|null);

        /** PB_ActivityState start_time */
        start_time?: (number|null);

        /** PB_ActivityState end_time */
        end_time?: (number|null);

        /** PB_ActivityState round */
        round?: (number|null);

        /** PB_ActivityState last_window_end */
        last_window_end?: (number|null);

        /** PB_ActivityState update_time */
        update_time?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ActivityState. */
    type $Shape = PB_ActivityState.$Properties;
}

/**
 * Properties of a PB_ServerGlobalData.
 * @deprecated Use PB_ServerGlobalData.$Properties instead.
 */
export interface IPB_ServerGlobalData extends PB_ServerGlobalData.$Properties {
}

/** Represents a PB_ServerGlobalData. */
export class PB_ServerGlobalData {

    /**
     * Constructs a new PB_ServerGlobalData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ServerGlobalData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ServerGlobalData server_begin_timestamp. */
    server_begin_timestamp?: (number|null);

    /** PB_ServerGlobalData next_month_timestamp. */
    next_month_timestamp?: (number|null);

    /** PB_ServerGlobalData next_week_timestamp. */
    next_week_timestamp?: (number|null);

    /** PB_ServerGlobalData last_update_dayid. */
    last_update_dayid?: (number|null);

    /**
     * Creates a new PB_ServerGlobalData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ServerGlobalData instance
     */
    static create(properties: PB_ServerGlobalData.$Shape): PB_ServerGlobalData & PB_ServerGlobalData.$Shape;
    static create(properties?: PB_ServerGlobalData.$Properties): PB_ServerGlobalData;

    /**
     * Encodes the specified PB_ServerGlobalData message. Does not implicitly {@link PB_ServerGlobalData.verify|verify} messages.
     * @param message PB_ServerGlobalData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ServerGlobalData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ServerGlobalData message, length delimited. Does not implicitly {@link PB_ServerGlobalData.verify|verify} messages.
     * @param message PB_ServerGlobalData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ServerGlobalData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ServerGlobalData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ServerGlobalData & PB_ServerGlobalData.$Shape} PB_ServerGlobalData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ServerGlobalData & PB_ServerGlobalData.$Shape;

    /**
     * Decodes a PB_ServerGlobalData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ServerGlobalData & PB_ServerGlobalData.$Shape} PB_ServerGlobalData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ServerGlobalData & PB_ServerGlobalData.$Shape;

    /**
     * Verifies a PB_ServerGlobalData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ServerGlobalData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ServerGlobalData
     */
    static fromObject(object: { [k: string]: any }): PB_ServerGlobalData;

    /**
     * Creates a plain object from a PB_ServerGlobalData message. Also converts values to other types if specified.
     * @param message PB_ServerGlobalData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ServerGlobalData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ServerGlobalData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ServerGlobalData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ServerGlobalData {

    /** Properties of a PB_ServerGlobalData. */
    interface $Properties {

        /** PB_ServerGlobalData server_begin_timestamp */
        server_begin_timestamp?: (number|null);

        /** PB_ServerGlobalData next_month_timestamp */
        next_month_timestamp?: (number|null);

        /** PB_ServerGlobalData next_week_timestamp */
        next_week_timestamp?: (number|null);

        /** PB_ServerGlobalData last_update_dayid */
        last_update_dayid?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ServerGlobalData. */
    type $Shape = PB_ServerGlobalData.$Properties;
}

/**
 * Properties of a PB_ChatData.
 * @deprecated Use PB_ChatData.$Properties instead.
 */
export interface IPB_ChatData extends PB_ChatData.$Properties {
}

/** Represents a PB_ChatData. */
export class PB_ChatData {

    /**
     * Constructs a new PB_ChatData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ChatData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ChatData chat_id. */
    chat_id?: (number|null);

    /** PB_ChatData chat_msg. */
    chat_msg?: (string|null);

    /** PB_ChatData user_name. */
    user_name?: (string|null);

    /** PB_ChatData name. */
    name?: (string|null);

    /** PB_ChatData uid. */
    uid?: (number|null);

    /** PB_ChatData time. */
    time?: (number|null);

    /**
     * Creates a new PB_ChatData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ChatData instance
     */
    static create(properties: PB_ChatData.$Shape): PB_ChatData & PB_ChatData.$Shape;
    static create(properties?: PB_ChatData.$Properties): PB_ChatData;

    /**
     * Encodes the specified PB_ChatData message. Does not implicitly {@link PB_ChatData.verify|verify} messages.
     * @param message PB_ChatData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ChatData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ChatData message, length delimited. Does not implicitly {@link PB_ChatData.verify|verify} messages.
     * @param message PB_ChatData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ChatData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ChatData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ChatData & PB_ChatData.$Shape} PB_ChatData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ChatData & PB_ChatData.$Shape;

    /**
     * Decodes a PB_ChatData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ChatData & PB_ChatData.$Shape} PB_ChatData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ChatData & PB_ChatData.$Shape;

    /**
     * Verifies a PB_ChatData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ChatData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ChatData
     */
    static fromObject(object: { [k: string]: any }): PB_ChatData;

    /**
     * Creates a plain object from a PB_ChatData message. Also converts values to other types if specified.
     * @param message PB_ChatData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ChatData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ChatData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ChatData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ChatData {

    /** Properties of a PB_ChatData. */
    interface $Properties {

        /** PB_ChatData chat_id */
        chat_id?: (number|null);

        /** PB_ChatData chat_msg */
        chat_msg?: (string|null);

        /** PB_ChatData user_name */
        user_name?: (string|null);

        /** PB_ChatData name */
        name?: (string|null);

        /** PB_ChatData uid */
        uid?: (number|null);

        /** PB_ChatData time */
        time?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ChatData. */
    type $Shape = PB_ChatData.$Properties;
}

/**
 * Properties of a PB_Item.
 * @deprecated Use PB_Item.$Properties instead.
 */
export interface IPB_Item extends PB_Item.$Properties {
}

/** Represents a PB_Item. */
export class PB_Item {

    /**
     * Constructs a new PB_Item.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_Item.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_Item slot_index. */
    slot_index?: (number|null);

    /** PB_Item item_id. */
    item_id?: (number|null);

    /** PB_Item num. */
    num?: (number|null);

    /** PB_Item stat_tags. */
    stat_tags: { [k: string]: number };

    /**
     * Creates a new PB_Item instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_Item instance
     */
    static create(properties: PB_Item.$Shape): PB_Item & PB_Item.$Shape;
    static create(properties?: PB_Item.$Properties): PB_Item;

    /**
     * Encodes the specified PB_Item message. Does not implicitly {@link PB_Item.verify|verify} messages.
     * @param message PB_Item message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_Item.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_Item message, length delimited. Does not implicitly {@link PB_Item.verify|verify} messages.
     * @param message PB_Item message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_Item.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_Item message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_Item & PB_Item.$Shape} PB_Item
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_Item & PB_Item.$Shape;

    /**
     * Decodes a PB_Item message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_Item & PB_Item.$Shape} PB_Item
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_Item & PB_Item.$Shape;

    /**
     * Verifies a PB_Item message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_Item message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_Item
     */
    static fromObject(object: { [k: string]: any }): PB_Item;

    /**
     * Creates a plain object from a PB_Item message. Also converts values to other types if specified.
     * @param message PB_Item
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_Item, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_Item to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_Item
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_Item {

    /** Properties of a PB_Item. */
    interface $Properties {

        /** PB_Item slot_index */
        slot_index?: (number|null);

        /** PB_Item item_id */
        item_id?: (number|null);

        /** PB_Item num */
        num?: (number|null);

        /** PB_Item stat_tags */
        stat_tags?: ({ [k: string]: number }|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_Item. */
    type $Shape = PB_Item.$Properties;
}

/**
 * Properties of a PB_KnapsackData.
 * @deprecated Use PB_KnapsackData.$Properties instead.
 */
export interface IPB_KnapsackData extends PB_KnapsackData.$Properties {
}

/** Represents a PB_KnapsackData. */
export class PB_KnapsackData {

    /**
     * Constructs a new PB_KnapsackData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_KnapsackData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_KnapsackData slots. */
    slots: PB_Item.$Properties[];

    /**
     * Creates a new PB_KnapsackData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_KnapsackData instance
     */
    static create(properties: PB_KnapsackData.$Shape): PB_KnapsackData & PB_KnapsackData.$Shape;
    static create(properties?: PB_KnapsackData.$Properties): PB_KnapsackData;

    /**
     * Encodes the specified PB_KnapsackData message. Does not implicitly {@link PB_KnapsackData.verify|verify} messages.
     * @param message PB_KnapsackData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_KnapsackData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_KnapsackData message, length delimited. Does not implicitly {@link PB_KnapsackData.verify|verify} messages.
     * @param message PB_KnapsackData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_KnapsackData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_KnapsackData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_KnapsackData & PB_KnapsackData.$Shape} PB_KnapsackData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_KnapsackData & PB_KnapsackData.$Shape;

    /**
     * Decodes a PB_KnapsackData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_KnapsackData & PB_KnapsackData.$Shape} PB_KnapsackData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_KnapsackData & PB_KnapsackData.$Shape;

    /**
     * Verifies a PB_KnapsackData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_KnapsackData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_KnapsackData
     */
    static fromObject(object: { [k: string]: any }): PB_KnapsackData;

    /**
     * Creates a plain object from a PB_KnapsackData message. Also converts values to other types if specified.
     * @param message PB_KnapsackData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_KnapsackData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_KnapsackData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_KnapsackData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_KnapsackData {

    /** Properties of a PB_KnapsackData. */
    interface $Properties {

        /** PB_KnapsackData slots */
        slots?: (PB_Item.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_KnapsackData. */
    type $Shape = PB_KnapsackData.$Properties;
}

/**
 * Properties of a PB_AttrPair.
 * @deprecated Use PB_AttrPair.$Properties instead.
 */
export interface IPB_AttrPair extends PB_AttrPair.$Properties {
}

/** Represents a PB_AttrPair. */
export class PB_AttrPair {

    /**
     * Constructs a new PB_AttrPair.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_AttrPair.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_AttrPair attr_id. */
    attr_id?: (number|null);

    /** PB_AttrPair value. */
    value?: (number|null);

    /**
     * Creates a new PB_AttrPair instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_AttrPair instance
     */
    static create(properties: PB_AttrPair.$Shape): PB_AttrPair & PB_AttrPair.$Shape;
    static create(properties?: PB_AttrPair.$Properties): PB_AttrPair;

    /**
     * Encodes the specified PB_AttrPair message. Does not implicitly {@link PB_AttrPair.verify|verify} messages.
     * @param message PB_AttrPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_AttrPair.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_AttrPair message, length delimited. Does not implicitly {@link PB_AttrPair.verify|verify} messages.
     * @param message PB_AttrPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_AttrPair.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_AttrPair message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_AttrPair & PB_AttrPair.$Shape} PB_AttrPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_AttrPair & PB_AttrPair.$Shape;

    /**
     * Decodes a PB_AttrPair message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_AttrPair & PB_AttrPair.$Shape} PB_AttrPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_AttrPair & PB_AttrPair.$Shape;

    /**
     * Verifies a PB_AttrPair message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_AttrPair message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_AttrPair
     */
    static fromObject(object: { [k: string]: any }): PB_AttrPair;

    /**
     * Creates a plain object from a PB_AttrPair message. Also converts values to other types if specified.
     * @param message PB_AttrPair
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_AttrPair, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_AttrPair to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_AttrPair
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_AttrPair {

    /** Properties of a PB_AttrPair. */
    interface $Properties {

        /** PB_AttrPair attr_id */
        attr_id?: (number|null);

        /** PB_AttrPair value */
        value?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_AttrPair. */
    type $Shape = PB_AttrPair.$Properties;
}

/**
 * Properties of a PB_AttrData.
 * @deprecated Use PB_AttrData.$Properties instead.
 */
export interface IPB_AttrData extends PB_AttrData.$Properties {
}

/** Represents a PB_AttrData. */
export class PB_AttrData {

    /**
     * Constructs a new PB_AttrData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_AttrData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_AttrData attrs. */
    attrs: PB_AttrPair.$Properties[];

    /**
     * Creates a new PB_AttrData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_AttrData instance
     */
    static create(properties: PB_AttrData.$Shape): PB_AttrData & PB_AttrData.$Shape;
    static create(properties?: PB_AttrData.$Properties): PB_AttrData;

    /**
     * Encodes the specified PB_AttrData message. Does not implicitly {@link PB_AttrData.verify|verify} messages.
     * @param message PB_AttrData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_AttrData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_AttrData message, length delimited. Does not implicitly {@link PB_AttrData.verify|verify} messages.
     * @param message PB_AttrData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_AttrData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_AttrData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_AttrData & PB_AttrData.$Shape} PB_AttrData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_AttrData & PB_AttrData.$Shape;

    /**
     * Decodes a PB_AttrData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_AttrData & PB_AttrData.$Shape} PB_AttrData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_AttrData & PB_AttrData.$Shape;

    /**
     * Verifies a PB_AttrData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_AttrData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_AttrData
     */
    static fromObject(object: { [k: string]: any }): PB_AttrData;

    /**
     * Creates a plain object from a PB_AttrData message. Also converts values to other types if specified.
     * @param message PB_AttrData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_AttrData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_AttrData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_AttrData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_AttrData {

    /** Properties of a PB_AttrData. */
    interface $Properties {

        /** PB_AttrData attrs */
        attrs?: (PB_AttrPair.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_AttrData. */
    type $Shape = PB_AttrData.$Properties;
}

/**
 * Properties of a PB_AbilitiesData.
 * @deprecated Use PB_AbilitiesData.$Properties instead.
 */
export interface IPB_AbilitiesData extends PB_AbilitiesData.$Properties {
}

/** Represents a PB_AbilitiesData. */
export class PB_AbilitiesData {

    /**
     * Constructs a new PB_AbilitiesData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_AbilitiesData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_AbilitiesData ability_ids. */
    ability_ids: number[];

    /**
     * Creates a new PB_AbilitiesData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_AbilitiesData instance
     */
    static create(properties: PB_AbilitiesData.$Shape): PB_AbilitiesData & PB_AbilitiesData.$Shape;
    static create(properties?: PB_AbilitiesData.$Properties): PB_AbilitiesData;

    /**
     * Encodes the specified PB_AbilitiesData message. Does not implicitly {@link PB_AbilitiesData.verify|verify} messages.
     * @param message PB_AbilitiesData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_AbilitiesData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_AbilitiesData message, length delimited. Does not implicitly {@link PB_AbilitiesData.verify|verify} messages.
     * @param message PB_AbilitiesData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_AbilitiesData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_AbilitiesData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_AbilitiesData & PB_AbilitiesData.$Shape} PB_AbilitiesData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_AbilitiesData & PB_AbilitiesData.$Shape;

    /**
     * Decodes a PB_AbilitiesData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_AbilitiesData & PB_AbilitiesData.$Shape} PB_AbilitiesData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_AbilitiesData & PB_AbilitiesData.$Shape;

    /**
     * Verifies a PB_AbilitiesData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_AbilitiesData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_AbilitiesData
     */
    static fromObject(object: { [k: string]: any }): PB_AbilitiesData;

    /**
     * Creates a plain object from a PB_AbilitiesData message. Also converts values to other types if specified.
     * @param message PB_AbilitiesData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_AbilitiesData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_AbilitiesData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_AbilitiesData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_AbilitiesData {

    /** Properties of a PB_AbilitiesData. */
    interface $Properties {

        /** PB_AbilitiesData ability_ids */
        ability_ids?: (number[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_AbilitiesData. */
    type $Shape = PB_AbilitiesData.$Properties;
}

/**
 * Properties of a PB_TaskObjectiveData.
 * @deprecated Use PB_TaskObjectiveData.$Properties instead.
 */
export interface IPB_TaskObjectiveData extends PB_TaskObjectiveData.$Properties {
}

/** Represents a PB_TaskObjectiveData. */
export class PB_TaskObjectiveData {

    /**
     * Constructs a new PB_TaskObjectiveData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_TaskObjectiveData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_TaskObjectiveData current_count. */
    current_count?: (number|null);

    /** PB_TaskObjectiveData completed. */
    completed?: (boolean|null);

    /**
     * Creates a new PB_TaskObjectiveData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_TaskObjectiveData instance
     */
    static create(properties: PB_TaskObjectiveData.$Shape): PB_TaskObjectiveData & PB_TaskObjectiveData.$Shape;
    static create(properties?: PB_TaskObjectiveData.$Properties): PB_TaskObjectiveData;

    /**
     * Encodes the specified PB_TaskObjectiveData message. Does not implicitly {@link PB_TaskObjectiveData.verify|verify} messages.
     * @param message PB_TaskObjectiveData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_TaskObjectiveData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_TaskObjectiveData message, length delimited. Does not implicitly {@link PB_TaskObjectiveData.verify|verify} messages.
     * @param message PB_TaskObjectiveData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_TaskObjectiveData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_TaskObjectiveData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_TaskObjectiveData & PB_TaskObjectiveData.$Shape} PB_TaskObjectiveData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_TaskObjectiveData & PB_TaskObjectiveData.$Shape;

    /**
     * Decodes a PB_TaskObjectiveData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_TaskObjectiveData & PB_TaskObjectiveData.$Shape} PB_TaskObjectiveData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_TaskObjectiveData & PB_TaskObjectiveData.$Shape;

    /**
     * Verifies a PB_TaskObjectiveData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_TaskObjectiveData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_TaskObjectiveData
     */
    static fromObject(object: { [k: string]: any }): PB_TaskObjectiveData;

    /**
     * Creates a plain object from a PB_TaskObjectiveData message. Also converts values to other types if specified.
     * @param message PB_TaskObjectiveData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_TaskObjectiveData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_TaskObjectiveData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_TaskObjectiveData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_TaskObjectiveData {

    /** Properties of a PB_TaskObjectiveData. */
    interface $Properties {

        /** PB_TaskObjectiveData current_count */
        current_count?: (number|null);

        /** PB_TaskObjectiveData completed */
        completed?: (boolean|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_TaskObjectiveData. */
    type $Shape = PB_TaskObjectiveData.$Properties;
}

/**
 * Properties of a PB_TaskSaveData.
 * @deprecated Use PB_TaskSaveData.$Properties instead.
 */
export interface IPB_TaskSaveData extends PB_TaskSaveData.$Properties {
}

/** Represents a PB_TaskSaveData. */
export class PB_TaskSaveData {

    /**
     * Constructs a new PB_TaskSaveData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_TaskSaveData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_TaskSaveData status. */
    status?: (number|null);

    /** PB_TaskSaveData start_time. */
    start_time?: (number|null);

    /** PB_TaskSaveData complete_time. */
    complete_time?: (number|null);

    /** PB_TaskSaveData objectives. */
    objectives: PB_TaskObjectiveData.$Properties[];

    /**
     * Creates a new PB_TaskSaveData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_TaskSaveData instance
     */
    static create(properties: PB_TaskSaveData.$Shape): PB_TaskSaveData & PB_TaskSaveData.$Shape;
    static create(properties?: PB_TaskSaveData.$Properties): PB_TaskSaveData;

    /**
     * Encodes the specified PB_TaskSaveData message. Does not implicitly {@link PB_TaskSaveData.verify|verify} messages.
     * @param message PB_TaskSaveData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_TaskSaveData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_TaskSaveData message, length delimited. Does not implicitly {@link PB_TaskSaveData.verify|verify} messages.
     * @param message PB_TaskSaveData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_TaskSaveData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_TaskSaveData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_TaskSaveData & PB_TaskSaveData.$Shape} PB_TaskSaveData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_TaskSaveData & PB_TaskSaveData.$Shape;

    /**
     * Decodes a PB_TaskSaveData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_TaskSaveData & PB_TaskSaveData.$Shape} PB_TaskSaveData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_TaskSaveData & PB_TaskSaveData.$Shape;

    /**
     * Verifies a PB_TaskSaveData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_TaskSaveData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_TaskSaveData
     */
    static fromObject(object: { [k: string]: any }): PB_TaskSaveData;

    /**
     * Creates a plain object from a PB_TaskSaveData message. Also converts values to other types if specified.
     * @param message PB_TaskSaveData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_TaskSaveData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_TaskSaveData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_TaskSaveData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_TaskSaveData {

    /** Properties of a PB_TaskSaveData. */
    interface $Properties {

        /** PB_TaskSaveData status */
        status?: (number|null);

        /** PB_TaskSaveData start_time */
        start_time?: (number|null);

        /** PB_TaskSaveData complete_time */
        complete_time?: (number|null);

        /** PB_TaskSaveData objectives */
        objectives?: (PB_TaskObjectiveData.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_TaskSaveData. */
    type $Shape = PB_TaskSaveData.$Properties;
}

/**
 * Properties of a PB_TaskData.
 * @deprecated Use PB_TaskData.$Properties instead.
 */
export interface IPB_TaskData extends PB_TaskData.$Properties {
}

/** Represents a PB_TaskData. */
export class PB_TaskData {

    /**
     * Constructs a new PB_TaskData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_TaskData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_TaskData max_active. */
    max_active?: (number|null);

    /** PB_TaskData active_tasks. */
    active_tasks: { [k: string]: PB_TaskSaveData.$Properties };

    /** PB_TaskData completed_tasks. */
    completed_tasks: number[];

    /**
     * Creates a new PB_TaskData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_TaskData instance
     */
    static create(properties: PB_TaskData.$Shape): PB_TaskData & PB_TaskData.$Shape;
    static create(properties?: PB_TaskData.$Properties): PB_TaskData;

    /**
     * Encodes the specified PB_TaskData message. Does not implicitly {@link PB_TaskData.verify|verify} messages.
     * @param message PB_TaskData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_TaskData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_TaskData message, length delimited. Does not implicitly {@link PB_TaskData.verify|verify} messages.
     * @param message PB_TaskData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_TaskData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_TaskData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_TaskData & PB_TaskData.$Shape} PB_TaskData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_TaskData & PB_TaskData.$Shape;

    /**
     * Decodes a PB_TaskData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_TaskData & PB_TaskData.$Shape} PB_TaskData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_TaskData & PB_TaskData.$Shape;

    /**
     * Verifies a PB_TaskData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_TaskData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_TaskData
     */
    static fromObject(object: { [k: string]: any }): PB_TaskData;

    /**
     * Creates a plain object from a PB_TaskData message. Also converts values to other types if specified.
     * @param message PB_TaskData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_TaskData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_TaskData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_TaskData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_TaskData {

    /** Properties of a PB_TaskData. */
    interface $Properties {

        /** PB_TaskData max_active */
        max_active?: (number|null);

        /** PB_TaskData active_tasks */
        active_tasks?: ({ [k: string]: PB_TaskSaveData.$Properties }|null);

        /** PB_TaskData completed_tasks */
        completed_tasks?: (number[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_TaskData. */
    type $Shape = PB_TaskData.$Properties;
}

/**
 * Properties of a PB_HeroData.
 * @deprecated Use PB_HeroData.$Properties instead.
 */
export interface IPB_HeroData extends PB_HeroData.$Properties {
}

/** Represents a PB_HeroData. */
export class PB_HeroData {

    /**
     * Constructs a new PB_HeroData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_HeroData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_HeroData hero_id. */
    hero_id?: (number|null);

    /** PB_HeroData level. */
    level?: (number|null);

    /** PB_HeroData exp. */
    exp?: (number|null);

    /** PB_HeroData abilities. */
    abilities?: (PB_AbilitiesData.$Properties|null);

    /** PB_HeroData attrs. */
    attrs?: (PB_AttrData.$Properties|null);

    /** PB_HeroData combat_power. */
    combat_power?: (number|null);

    /**
     * Creates a new PB_HeroData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_HeroData instance
     */
    static create(properties: PB_HeroData.$Shape): PB_HeroData & PB_HeroData.$Shape;
    static create(properties?: PB_HeroData.$Properties): PB_HeroData;

    /**
     * Encodes the specified PB_HeroData message. Does not implicitly {@link PB_HeroData.verify|verify} messages.
     * @param message PB_HeroData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_HeroData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_HeroData message, length delimited. Does not implicitly {@link PB_HeroData.verify|verify} messages.
     * @param message PB_HeroData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_HeroData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_HeroData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_HeroData & PB_HeroData.$Shape} PB_HeroData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_HeroData & PB_HeroData.$Shape;

    /**
     * Decodes a PB_HeroData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_HeroData & PB_HeroData.$Shape} PB_HeroData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_HeroData & PB_HeroData.$Shape;

    /**
     * Verifies a PB_HeroData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_HeroData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_HeroData
     */
    static fromObject(object: { [k: string]: any }): PB_HeroData;

    /**
     * Creates a plain object from a PB_HeroData message. Also converts values to other types if specified.
     * @param message PB_HeroData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_HeroData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_HeroData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_HeroData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_HeroData {

    /** Properties of a PB_HeroData. */
    interface $Properties {

        /** PB_HeroData hero_id */
        hero_id?: (number|null);

        /** PB_HeroData level */
        level?: (number|null);

        /** PB_HeroData exp */
        exp?: (number|null);

        /** PB_HeroData abilities */
        abilities?: (PB_AbilitiesData.$Properties|null);

        /** PB_HeroData attrs */
        attrs?: (PB_AttrData.$Properties|null);

        /** PB_HeroData combat_power */
        combat_power?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_HeroData. */
    type $Shape = PB_HeroData.$Properties;
}

/**
 * Properties of a PB_HeroListData.
 * @deprecated Use PB_HeroListData.$Properties instead.
 */
export interface IPB_HeroListData extends PB_HeroListData.$Properties {
}

/** Represents a PB_HeroListData. */
export class PB_HeroListData {

    /**
     * Constructs a new PB_HeroListData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_HeroListData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_HeroListData heroes. */
    heroes: PB_HeroData.$Properties[];

    /**
     * Creates a new PB_HeroListData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_HeroListData instance
     */
    static create(properties: PB_HeroListData.$Shape): PB_HeroListData & PB_HeroListData.$Shape;
    static create(properties?: PB_HeroListData.$Properties): PB_HeroListData;

    /**
     * Encodes the specified PB_HeroListData message. Does not implicitly {@link PB_HeroListData.verify|verify} messages.
     * @param message PB_HeroListData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_HeroListData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_HeroListData message, length delimited. Does not implicitly {@link PB_HeroListData.verify|verify} messages.
     * @param message PB_HeroListData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_HeroListData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_HeroListData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_HeroListData & PB_HeroListData.$Shape} PB_HeroListData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_HeroListData & PB_HeroListData.$Shape;

    /**
     * Decodes a PB_HeroListData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_HeroListData & PB_HeroListData.$Shape} PB_HeroListData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_HeroListData & PB_HeroListData.$Shape;

    /**
     * Verifies a PB_HeroListData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_HeroListData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_HeroListData
     */
    static fromObject(object: { [k: string]: any }): PB_HeroListData;

    /**
     * Creates a plain object from a PB_HeroListData message. Also converts values to other types if specified.
     * @param message PB_HeroListData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_HeroListData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_HeroListData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_HeroListData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_HeroListData {

    /** Properties of a PB_HeroListData. */
    interface $Properties {

        /** PB_HeroListData heroes */
        heroes?: (PB_HeroData.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_HeroListData. */
    type $Shape = PB_HeroListData.$Properties;
}

/**
 * Properties of a PB_LineupData.
 * @deprecated Use PB_LineupData.$Properties instead.
 */
export interface IPB_LineupData extends PB_LineupData.$Properties {
}

/** Represents a PB_LineupData. */
export class PB_LineupData {

    /**
     * Constructs a new PB_LineupData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_LineupData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_LineupData battle_type. */
    battle_type?: (number|null);

    /** PB_LineupData hero_ids. */
    hero_ids: number[];

    /** PB_LineupData combat_power. */
    combat_power?: (number|null);

    /** PB_LineupData slot. */
    slot?: (number|null);

    /**
     * Creates a new PB_LineupData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_LineupData instance
     */
    static create(properties: PB_LineupData.$Shape): PB_LineupData & PB_LineupData.$Shape;
    static create(properties?: PB_LineupData.$Properties): PB_LineupData;

    /**
     * Encodes the specified PB_LineupData message. Does not implicitly {@link PB_LineupData.verify|verify} messages.
     * @param message PB_LineupData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_LineupData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_LineupData message, length delimited. Does not implicitly {@link PB_LineupData.verify|verify} messages.
     * @param message PB_LineupData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_LineupData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_LineupData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_LineupData & PB_LineupData.$Shape} PB_LineupData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_LineupData & PB_LineupData.$Shape;

    /**
     * Decodes a PB_LineupData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_LineupData & PB_LineupData.$Shape} PB_LineupData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_LineupData & PB_LineupData.$Shape;

    /**
     * Verifies a PB_LineupData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_LineupData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_LineupData
     */
    static fromObject(object: { [k: string]: any }): PB_LineupData;

    /**
     * Creates a plain object from a PB_LineupData message. Also converts values to other types if specified.
     * @param message PB_LineupData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_LineupData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_LineupData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_LineupData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_LineupData {

    /** Properties of a PB_LineupData. */
    interface $Properties {

        /** PB_LineupData battle_type */
        battle_type?: (number|null);

        /** PB_LineupData hero_ids */
        hero_ids?: (number[]|null);

        /** PB_LineupData combat_power */
        combat_power?: (number|null);

        /** PB_LineupData slot */
        slot?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_LineupData. */
    type $Shape = PB_LineupData.$Properties;
}

/**
 * Properties of a PB_LineupListData.
 * @deprecated Use PB_LineupListData.$Properties instead.
 */
export interface IPB_LineupListData extends PB_LineupListData.$Properties {
}

/** Represents a PB_LineupListData. */
export class PB_LineupListData {

    /**
     * Constructs a new PB_LineupListData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_LineupListData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_LineupListData lineups. */
    lineups: PB_LineupData.$Properties[];

    /**
     * Creates a new PB_LineupListData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_LineupListData instance
     */
    static create(properties: PB_LineupListData.$Shape): PB_LineupListData & PB_LineupListData.$Shape;
    static create(properties?: PB_LineupListData.$Properties): PB_LineupListData;

    /**
     * Encodes the specified PB_LineupListData message. Does not implicitly {@link PB_LineupListData.verify|verify} messages.
     * @param message PB_LineupListData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_LineupListData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_LineupListData message, length delimited. Does not implicitly {@link PB_LineupListData.verify|verify} messages.
     * @param message PB_LineupListData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_LineupListData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_LineupListData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_LineupListData & PB_LineupListData.$Shape} PB_LineupListData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_LineupListData & PB_LineupListData.$Shape;

    /**
     * Decodes a PB_LineupListData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_LineupListData & PB_LineupListData.$Shape} PB_LineupListData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_LineupListData & PB_LineupListData.$Shape;

    /**
     * Verifies a PB_LineupListData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_LineupListData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_LineupListData
     */
    static fromObject(object: { [k: string]: any }): PB_LineupListData;

    /**
     * Creates a plain object from a PB_LineupListData message. Also converts values to other types if specified.
     * @param message PB_LineupListData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_LineupListData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_LineupListData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_LineupListData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_LineupListData {

    /** Properties of a PB_LineupListData. */
    interface $Properties {

        /** PB_LineupListData lineups */
        lineups?: (PB_LineupData.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_LineupListData. */
    type $Shape = PB_LineupListData.$Properties;
}

/**
 * Properties of a PB_RankNode.
 * @deprecated Use PB_RankNode.$Properties instead.
 */
export interface IPB_RankNode extends PB_RankNode.$Properties {
}

/** Represents a PB_RankNode. */
export class PB_RankNode {

    /**
     * Constructs a new PB_RankNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_RankNode.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_RankNode rank. */
    rank?: (number|null);

    /** PB_RankNode uid. */
    uid?: (number|null);

    /** PB_RankNode name. */
    name?: (string|null);

    /** PB_RankNode value. */
    value?: (number|null);

    /** PB_RankNode param1. */
    param1?: (number|null);

    /** PB_RankNode param2. */
    param2?: (number|null);

    /** PB_RankNode param3. */
    param3?: (number|null);

    /** PB_RankNode update_time. */
    update_time?: (number|null);

    /** PB_RankNode power. */
    power?: (number|null);

    /** PB_RankNode heroes. */
    heroes: PB_HeroData.$Properties[];

    /**
     * Creates a new PB_RankNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_RankNode instance
     */
    static create(properties: PB_RankNode.$Shape): PB_RankNode & PB_RankNode.$Shape;
    static create(properties?: PB_RankNode.$Properties): PB_RankNode;

    /**
     * Encodes the specified PB_RankNode message. Does not implicitly {@link PB_RankNode.verify|verify} messages.
     * @param message PB_RankNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_RankNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_RankNode message, length delimited. Does not implicitly {@link PB_RankNode.verify|verify} messages.
     * @param message PB_RankNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_RankNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_RankNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_RankNode & PB_RankNode.$Shape} PB_RankNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_RankNode & PB_RankNode.$Shape;

    /**
     * Decodes a PB_RankNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_RankNode & PB_RankNode.$Shape} PB_RankNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_RankNode & PB_RankNode.$Shape;

    /**
     * Verifies a PB_RankNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_RankNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_RankNode
     */
    static fromObject(object: { [k: string]: any }): PB_RankNode;

    /**
     * Creates a plain object from a PB_RankNode message. Also converts values to other types if specified.
     * @param message PB_RankNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_RankNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_RankNode to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_RankNode
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_RankNode {

    /** Properties of a PB_RankNode. */
    interface $Properties {

        /** PB_RankNode rank */
        rank?: (number|null);

        /** PB_RankNode uid */
        uid?: (number|null);

        /** PB_RankNode name */
        name?: (string|null);

        /** PB_RankNode value */
        value?: (number|null);

        /** PB_RankNode param1 */
        param1?: (number|null);

        /** PB_RankNode param2 */
        param2?: (number|null);

        /** PB_RankNode param3 */
        param3?: (number|null);

        /** PB_RankNode update_time */
        update_time?: (number|null);

        /** PB_RankNode power */
        power?: (number|null);

        /** PB_RankNode heroes */
        heroes?: (PB_HeroData.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_RankNode. */
    type $Shape = PB_RankNode.$Properties;
}

/**
 * Properties of a PB_ArenaRankNode.
 * @deprecated Use PB_ArenaRankNode.$Properties instead.
 */
export interface IPB_ArenaRankNode extends PB_ArenaRankNode.$Properties {
}

/** Represents a PB_ArenaRankNode. */
export class PB_ArenaRankNode {

    /**
     * Constructs a new PB_ArenaRankNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ArenaRankNode.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ArenaRankNode base. */
    base?: (PB_RankNode.$Properties|null);

    /**
     * Creates a new PB_ArenaRankNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ArenaRankNode instance
     */
    static create(properties: PB_ArenaRankNode.$Shape): PB_ArenaRankNode & PB_ArenaRankNode.$Shape;
    static create(properties?: PB_ArenaRankNode.$Properties): PB_ArenaRankNode;

    /**
     * Encodes the specified PB_ArenaRankNode message. Does not implicitly {@link PB_ArenaRankNode.verify|verify} messages.
     * @param message PB_ArenaRankNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ArenaRankNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ArenaRankNode message, length delimited. Does not implicitly {@link PB_ArenaRankNode.verify|verify} messages.
     * @param message PB_ArenaRankNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ArenaRankNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ArenaRankNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ArenaRankNode & PB_ArenaRankNode.$Shape} PB_ArenaRankNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ArenaRankNode & PB_ArenaRankNode.$Shape;

    /**
     * Decodes a PB_ArenaRankNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ArenaRankNode & PB_ArenaRankNode.$Shape} PB_ArenaRankNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ArenaRankNode & PB_ArenaRankNode.$Shape;

    /**
     * Verifies a PB_ArenaRankNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ArenaRankNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ArenaRankNode
     */
    static fromObject(object: { [k: string]: any }): PB_ArenaRankNode;

    /**
     * Creates a plain object from a PB_ArenaRankNode message. Also converts values to other types if specified.
     * @param message PB_ArenaRankNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ArenaRankNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ArenaRankNode to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ArenaRankNode
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ArenaRankNode {

    /** Properties of a PB_ArenaRankNode. */
    interface $Properties {

        /** PB_ArenaRankNode base */
        base?: (PB_RankNode.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ArenaRankNode. */
    type $Shape = PB_ArenaRankNode.$Properties;
}

/**
 * Properties of a P_ClusterHello.
 * @deprecated Use P_ClusterHello.$Properties instead.
 */
export interface IP_ClusterHello extends P_ClusterHello.$Properties {
}

/** Represents a P_ClusterHello. */
export class P_ClusterHello {

    /**
     * Constructs a new P_ClusterHello.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ClusterHello.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ClusterHello token. */
    token?: (string|null);

    /**
     * Creates a new P_ClusterHello instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ClusterHello instance
     */
    static create(properties: P_ClusterHello.$Shape): P_ClusterHello & P_ClusterHello.$Shape;
    static create(properties?: P_ClusterHello.$Properties): P_ClusterHello;

    /**
     * Encodes the specified P_ClusterHello message. Does not implicitly {@link P_ClusterHello.verify|verify} messages.
     * @param message P_ClusterHello message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ClusterHello.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ClusterHello message, length delimited. Does not implicitly {@link P_ClusterHello.verify|verify} messages.
     * @param message P_ClusterHello message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ClusterHello.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ClusterHello message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ClusterHello & P_ClusterHello.$Shape} P_ClusterHello
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ClusterHello & P_ClusterHello.$Shape;

    /**
     * Decodes a P_ClusterHello message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ClusterHello & P_ClusterHello.$Shape} P_ClusterHello
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ClusterHello & P_ClusterHello.$Shape;

    /**
     * Verifies a P_ClusterHello message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ClusterHello message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ClusterHello
     */
    static fromObject(object: { [k: string]: any }): P_ClusterHello;

    /**
     * Creates a plain object from a P_ClusterHello message. Also converts values to other types if specified.
     * @param message P_ClusterHello
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ClusterHello, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ClusterHello to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ClusterHello
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ClusterHello {

    /** Properties of a P_ClusterHello. */
    interface $Properties {

        /** P_ClusterHello token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ClusterHello. */
    type $Shape = P_ClusterHello.$Properties;
}

/**
 * Properties of a P_ClusterHeartbeat.
 * @deprecated Use P_ClusterHeartbeat.$Properties instead.
 */
export interface IP_ClusterHeartbeat extends P_ClusterHeartbeat.$Properties {
}

/** Represents a P_ClusterHeartbeat. */
export class P_ClusterHeartbeat {

    /**
     * Constructs a new P_ClusterHeartbeat.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ClusterHeartbeat.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ClusterHeartbeat load. */
    load?: (number|null);

    /**
     * Creates a new P_ClusterHeartbeat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ClusterHeartbeat instance
     */
    static create(properties: P_ClusterHeartbeat.$Shape): P_ClusterHeartbeat & P_ClusterHeartbeat.$Shape;
    static create(properties?: P_ClusterHeartbeat.$Properties): P_ClusterHeartbeat;

    /**
     * Encodes the specified P_ClusterHeartbeat message. Does not implicitly {@link P_ClusterHeartbeat.verify|verify} messages.
     * @param message P_ClusterHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ClusterHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ClusterHeartbeat message, length delimited. Does not implicitly {@link P_ClusterHeartbeat.verify|verify} messages.
     * @param message P_ClusterHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ClusterHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ClusterHeartbeat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ClusterHeartbeat & P_ClusterHeartbeat.$Shape} P_ClusterHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ClusterHeartbeat & P_ClusterHeartbeat.$Shape;

    /**
     * Decodes a P_ClusterHeartbeat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ClusterHeartbeat & P_ClusterHeartbeat.$Shape} P_ClusterHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ClusterHeartbeat & P_ClusterHeartbeat.$Shape;

    /**
     * Verifies a P_ClusterHeartbeat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ClusterHeartbeat message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ClusterHeartbeat
     */
    static fromObject(object: { [k: string]: any }): P_ClusterHeartbeat;

    /**
     * Creates a plain object from a P_ClusterHeartbeat message. Also converts values to other types if specified.
     * @param message P_ClusterHeartbeat
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ClusterHeartbeat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ClusterHeartbeat to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ClusterHeartbeat
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ClusterHeartbeat {

    /** Properties of a P_ClusterHeartbeat. */
    interface $Properties {

        /** P_ClusterHeartbeat load */
        load?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ClusterHeartbeat. */
    type $Shape = P_ClusterHeartbeat.$Properties;
}

/**
 * Properties of a P_ClusterNodeInfo.
 * @deprecated Use P_ClusterNodeInfo.$Properties instead.
 */
export interface IP_ClusterNodeInfo extends P_ClusterNodeInfo.$Properties {
}

/** Represents a P_ClusterNodeInfo. */
export class P_ClusterNodeInfo {

    /**
     * Constructs a new P_ClusterNodeInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ClusterNodeInfo.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ClusterNodeInfo zone_id. */
    zone_id?: (number|null);

    /** P_ClusterNodeInfo server_id. */
    server_id?: (number|null);

    /** P_ClusterNodeInfo node_type. */
    node_type?: (number|null);

    /** P_ClusterNodeInfo instance_id. */
    instance_id?: (number|null);

    /** P_ClusterNodeInfo load. */
    load?: (number|null);

    /** P_ClusterNodeInfo online. */
    online?: (boolean|null);

    /**
     * Creates a new P_ClusterNodeInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ClusterNodeInfo instance
     */
    static create(properties: P_ClusterNodeInfo.$Shape): P_ClusterNodeInfo & P_ClusterNodeInfo.$Shape;
    static create(properties?: P_ClusterNodeInfo.$Properties): P_ClusterNodeInfo;

    /**
     * Encodes the specified P_ClusterNodeInfo message. Does not implicitly {@link P_ClusterNodeInfo.verify|verify} messages.
     * @param message P_ClusterNodeInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ClusterNodeInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ClusterNodeInfo message, length delimited. Does not implicitly {@link P_ClusterNodeInfo.verify|verify} messages.
     * @param message P_ClusterNodeInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ClusterNodeInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ClusterNodeInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ClusterNodeInfo & P_ClusterNodeInfo.$Shape} P_ClusterNodeInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ClusterNodeInfo & P_ClusterNodeInfo.$Shape;

    /**
     * Decodes a P_ClusterNodeInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ClusterNodeInfo & P_ClusterNodeInfo.$Shape} P_ClusterNodeInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ClusterNodeInfo & P_ClusterNodeInfo.$Shape;

    /**
     * Verifies a P_ClusterNodeInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ClusterNodeInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ClusterNodeInfo
     */
    static fromObject(object: { [k: string]: any }): P_ClusterNodeInfo;

    /**
     * Creates a plain object from a P_ClusterNodeInfo message. Also converts values to other types if specified.
     * @param message P_ClusterNodeInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ClusterNodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ClusterNodeInfo to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ClusterNodeInfo
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ClusterNodeInfo {

    /** Properties of a P_ClusterNodeInfo. */
    interface $Properties {

        /** P_ClusterNodeInfo zone_id */
        zone_id?: (number|null);

        /** P_ClusterNodeInfo server_id */
        server_id?: (number|null);

        /** P_ClusterNodeInfo node_type */
        node_type?: (number|null);

        /** P_ClusterNodeInfo instance_id */
        instance_id?: (number|null);

        /** P_ClusterNodeInfo load */
        load?: (number|null);

        /** P_ClusterNodeInfo online */
        online?: (boolean|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ClusterNodeInfo. */
    type $Shape = P_ClusterNodeInfo.$Properties;
}

/**
 * Properties of a P_ClusterNodeList.
 * @deprecated Use P_ClusterNodeList.$Properties instead.
 */
export interface IP_ClusterNodeList extends P_ClusterNodeList.$Properties {
}

/** Represents a P_ClusterNodeList. */
export class P_ClusterNodeList {

    /**
     * Constructs a new P_ClusterNodeList.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ClusterNodeList.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ClusterNodeList nodes. */
    nodes: P_ClusterNodeInfo.$Properties[];

    /**
     * Creates a new P_ClusterNodeList instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ClusterNodeList instance
     */
    static create(properties: P_ClusterNodeList.$Shape): P_ClusterNodeList & P_ClusterNodeList.$Shape;
    static create(properties?: P_ClusterNodeList.$Properties): P_ClusterNodeList;

    /**
     * Encodes the specified P_ClusterNodeList message. Does not implicitly {@link P_ClusterNodeList.verify|verify} messages.
     * @param message P_ClusterNodeList message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ClusterNodeList.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ClusterNodeList message, length delimited. Does not implicitly {@link P_ClusterNodeList.verify|verify} messages.
     * @param message P_ClusterNodeList message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ClusterNodeList.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ClusterNodeList message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ClusterNodeList & P_ClusterNodeList.$Shape} P_ClusterNodeList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ClusterNodeList & P_ClusterNodeList.$Shape;

    /**
     * Decodes a P_ClusterNodeList message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ClusterNodeList & P_ClusterNodeList.$Shape} P_ClusterNodeList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ClusterNodeList & P_ClusterNodeList.$Shape;

    /**
     * Verifies a P_ClusterNodeList message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ClusterNodeList message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ClusterNodeList
     */
    static fromObject(object: { [k: string]: any }): P_ClusterNodeList;

    /**
     * Creates a plain object from a P_ClusterNodeList message. Also converts values to other types if specified.
     * @param message P_ClusterNodeList
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ClusterNodeList, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ClusterNodeList to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ClusterNodeList
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ClusterNodeList {

    /** Properties of a P_ClusterNodeList. */
    interface $Properties {

        /** P_ClusterNodeList nodes */
        nodes?: (P_ClusterNodeInfo.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ClusterNodeList. */
    type $Shape = P_ClusterNodeList.$Properties;
}

/**
 * Properties of a P_ClusterRpcReply.
 * @deprecated Use P_ClusterRpcReply.$Properties instead.
 */
export interface IP_ClusterRpcReply extends P_ClusterRpcReply.$Properties {
}

/** Represents a P_ClusterRpcReply. */
export class P_ClusterRpcReply {

    /**
     * Constructs a new P_ClusterRpcReply.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ClusterRpcReply.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ClusterRpcReply error_code. */
    error_code?: (number|null);

    /** P_ClusterRpcReply error_message. */
    error_message?: (string|null);

    /** P_ClusterRpcReply body. */
    body?: (Uint8Array|null);

    /**
     * Creates a new P_ClusterRpcReply instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ClusterRpcReply instance
     */
    static create(properties: P_ClusterRpcReply.$Shape): P_ClusterRpcReply & P_ClusterRpcReply.$Shape;
    static create(properties?: P_ClusterRpcReply.$Properties): P_ClusterRpcReply;

    /**
     * Encodes the specified P_ClusterRpcReply message. Does not implicitly {@link P_ClusterRpcReply.verify|verify} messages.
     * @param message P_ClusterRpcReply message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ClusterRpcReply.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ClusterRpcReply message, length delimited. Does not implicitly {@link P_ClusterRpcReply.verify|verify} messages.
     * @param message P_ClusterRpcReply message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ClusterRpcReply.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ClusterRpcReply message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ClusterRpcReply & P_ClusterRpcReply.$Shape} P_ClusterRpcReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ClusterRpcReply & P_ClusterRpcReply.$Shape;

    /**
     * Decodes a P_ClusterRpcReply message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ClusterRpcReply & P_ClusterRpcReply.$Shape} P_ClusterRpcReply
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ClusterRpcReply & P_ClusterRpcReply.$Shape;

    /**
     * Verifies a P_ClusterRpcReply message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ClusterRpcReply message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ClusterRpcReply
     */
    static fromObject(object: { [k: string]: any }): P_ClusterRpcReply;

    /**
     * Creates a plain object from a P_ClusterRpcReply message. Also converts values to other types if specified.
     * @param message P_ClusterRpcReply
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ClusterRpcReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ClusterRpcReply to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ClusterRpcReply
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ClusterRpcReply {

    /** Properties of a P_ClusterRpcReply. */
    interface $Properties {

        /** P_ClusterRpcReply error_code */
        error_code?: (number|null);

        /** P_ClusterRpcReply error_message */
        error_message?: (string|null);

        /** P_ClusterRpcReply body */
        body?: (Uint8Array|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ClusterRpcReply. */
    type $Shape = P_ClusterRpcReply.$Properties;
}

/**
 * Properties of a PB_CrossRoleSnapshot.
 * @deprecated Use PB_CrossRoleSnapshot.$Properties instead.
 */
export interface IPB_CrossRoleSnapshot extends PB_CrossRoleSnapshot.$Properties {
}

/** Represents a PB_CrossRoleSnapshot. */
export class PB_CrossRoleSnapshot {

    /**
     * Constructs a new PB_CrossRoleSnapshot.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_CrossRoleSnapshot.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_CrossRoleSnapshot role_uid. */
    role_uid?: (number|null);

    /** PB_CrossRoleSnapshot home_server_id. */
    home_server_id?: (number|null);

    /** PB_CrossRoleSnapshot scene_server_id. */
    scene_server_id?: (number|null);

    /** PB_CrossRoleSnapshot activity_id. */
    activity_id?: (number|null);

    /** PB_CrossRoleSnapshot extra. */
    extra?: (Uint8Array|null);

    /** PB_CrossRoleSnapshot role_data. */
    role_data?: (Uint8Array|null);

    /** PB_CrossRoleSnapshot scene_ip. */
    scene_ip?: (string|null);

    /** PB_CrossRoleSnapshot scene_port. */
    scene_port?: (number|null);

    /** PB_CrossRoleSnapshot token. */
    token?: (string|null);

    /** PB_CrossRoleSnapshot pos_x. */
    pos_x?: (number|null);

    /** PB_CrossRoleSnapshot pos_y. */
    pos_y?: (number|null);

    /** PB_CrossRoleSnapshot pos_z. */
    pos_z?: (number|null);

    /**
     * Creates a new PB_CrossRoleSnapshot instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_CrossRoleSnapshot instance
     */
    static create(properties: PB_CrossRoleSnapshot.$Shape): PB_CrossRoleSnapshot & PB_CrossRoleSnapshot.$Shape;
    static create(properties?: PB_CrossRoleSnapshot.$Properties): PB_CrossRoleSnapshot;

    /**
     * Encodes the specified PB_CrossRoleSnapshot message. Does not implicitly {@link PB_CrossRoleSnapshot.verify|verify} messages.
     * @param message PB_CrossRoleSnapshot message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_CrossRoleSnapshot.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_CrossRoleSnapshot message, length delimited. Does not implicitly {@link PB_CrossRoleSnapshot.verify|verify} messages.
     * @param message PB_CrossRoleSnapshot message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_CrossRoleSnapshot.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_CrossRoleSnapshot message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_CrossRoleSnapshot & PB_CrossRoleSnapshot.$Shape} PB_CrossRoleSnapshot
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_CrossRoleSnapshot & PB_CrossRoleSnapshot.$Shape;

    /**
     * Decodes a PB_CrossRoleSnapshot message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_CrossRoleSnapshot & PB_CrossRoleSnapshot.$Shape} PB_CrossRoleSnapshot
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_CrossRoleSnapshot & PB_CrossRoleSnapshot.$Shape;

    /**
     * Verifies a PB_CrossRoleSnapshot message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_CrossRoleSnapshot message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_CrossRoleSnapshot
     */
    static fromObject(object: { [k: string]: any }): PB_CrossRoleSnapshot;

    /**
     * Creates a plain object from a PB_CrossRoleSnapshot message. Also converts values to other types if specified.
     * @param message PB_CrossRoleSnapshot
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_CrossRoleSnapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_CrossRoleSnapshot to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_CrossRoleSnapshot
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_CrossRoleSnapshot {

    /** Properties of a PB_CrossRoleSnapshot. */
    interface $Properties {

        /** PB_CrossRoleSnapshot role_uid */
        role_uid?: (number|null);

        /** PB_CrossRoleSnapshot home_server_id */
        home_server_id?: (number|null);

        /** PB_CrossRoleSnapshot scene_server_id */
        scene_server_id?: (number|null);

        /** PB_CrossRoleSnapshot activity_id */
        activity_id?: (number|null);

        /** PB_CrossRoleSnapshot extra */
        extra?: (Uint8Array|null);

        /** PB_CrossRoleSnapshot role_data */
        role_data?: (Uint8Array|null);

        /** PB_CrossRoleSnapshot scene_ip */
        scene_ip?: (string|null);

        /** PB_CrossRoleSnapshot scene_port */
        scene_port?: (number|null);

        /** PB_CrossRoleSnapshot token */
        token?: (string|null);

        /** PB_CrossRoleSnapshot pos_x */
        pos_x?: (number|null);

        /** PB_CrossRoleSnapshot pos_y */
        pos_y?: (number|null);

        /** PB_CrossRoleSnapshot pos_z */
        pos_z?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_CrossRoleSnapshot. */
    type $Shape = PB_CrossRoleSnapshot.$Properties;
}

/**
 * Properties of a PB_CrossTicket.
 * @deprecated Use PB_CrossTicket.$Properties instead.
 */
export interface IPB_CrossTicket extends PB_CrossTicket.$Properties {
}

/** Represents a PB_CrossTicket. */
export class PB_CrossTicket {

    /**
     * Constructs a new PB_CrossTicket.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_CrossTicket.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_CrossTicket role_uid. */
    role_uid?: (number|null);

    /** PB_CrossTicket home_server_id. */
    home_server_id?: (number|null);

    /** PB_CrossTicket scene_server_id. */
    scene_server_id?: (number|null);

    /** PB_CrossTicket expire_time. */
    expire_time?: (number|null);

    /** PB_CrossTicket cross_type. */
    cross_type?: (number|null);

    /** PB_CrossTicket scene_ip. */
    scene_ip?: (string|null);

    /** PB_CrossTicket scene_port. */
    scene_port?: (number|null);

    /** PB_CrossTicket token. */
    token?: (string|null);

    /**
     * Creates a new PB_CrossTicket instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_CrossTicket instance
     */
    static create(properties: PB_CrossTicket.$Shape): PB_CrossTicket & PB_CrossTicket.$Shape;
    static create(properties?: PB_CrossTicket.$Properties): PB_CrossTicket;

    /**
     * Encodes the specified PB_CrossTicket message. Does not implicitly {@link PB_CrossTicket.verify|verify} messages.
     * @param message PB_CrossTicket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_CrossTicket.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_CrossTicket message, length delimited. Does not implicitly {@link PB_CrossTicket.verify|verify} messages.
     * @param message PB_CrossTicket message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_CrossTicket.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_CrossTicket message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_CrossTicket & PB_CrossTicket.$Shape} PB_CrossTicket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_CrossTicket & PB_CrossTicket.$Shape;

    /**
     * Decodes a PB_CrossTicket message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_CrossTicket & PB_CrossTicket.$Shape} PB_CrossTicket
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_CrossTicket & PB_CrossTicket.$Shape;

    /**
     * Verifies a PB_CrossTicket message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_CrossTicket message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_CrossTicket
     */
    static fromObject(object: { [k: string]: any }): PB_CrossTicket;

    /**
     * Creates a plain object from a PB_CrossTicket message. Also converts values to other types if specified.
     * @param message PB_CrossTicket
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_CrossTicket, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_CrossTicket to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_CrossTicket
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_CrossTicket {

    /** Properties of a PB_CrossTicket. */
    interface $Properties {

        /** PB_CrossTicket role_uid */
        role_uid?: (number|null);

        /** PB_CrossTicket home_server_id */
        home_server_id?: (number|null);

        /** PB_CrossTicket scene_server_id */
        scene_server_id?: (number|null);

        /** PB_CrossTicket expire_time */
        expire_time?: (number|null);

        /** PB_CrossTicket cross_type */
        cross_type?: (number|null);

        /** PB_CrossTicket scene_ip */
        scene_ip?: (string|null);

        /** PB_CrossTicket scene_port */
        scene_port?: (number|null);

        /** PB_CrossTicket token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_CrossTicket. */
    type $Shape = PB_CrossTicket.$Properties;
}

/**
 * Properties of a P_CrossLeave.
 * @deprecated Use P_CrossLeave.$Properties instead.
 */
export interface IP_CrossLeave extends P_CrossLeave.$Properties {
}

/** Represents a P_CrossLeave. */
export class P_CrossLeave {

    /**
     * Constructs a new P_CrossLeave.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_CrossLeave.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_CrossLeave role_uid. */
    role_uid?: (number|null);

    /**
     * Creates a new P_CrossLeave instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_CrossLeave instance
     */
    static create(properties: P_CrossLeave.$Shape): P_CrossLeave & P_CrossLeave.$Shape;
    static create(properties?: P_CrossLeave.$Properties): P_CrossLeave;

    /**
     * Encodes the specified P_CrossLeave message. Does not implicitly {@link P_CrossLeave.verify|verify} messages.
     * @param message P_CrossLeave message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_CrossLeave.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_CrossLeave message, length delimited. Does not implicitly {@link P_CrossLeave.verify|verify} messages.
     * @param message P_CrossLeave message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_CrossLeave.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_CrossLeave message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_CrossLeave & P_CrossLeave.$Shape} P_CrossLeave
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_CrossLeave & P_CrossLeave.$Shape;

    /**
     * Decodes a P_CrossLeave message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_CrossLeave & P_CrossLeave.$Shape} P_CrossLeave
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_CrossLeave & P_CrossLeave.$Shape;

    /**
     * Verifies a P_CrossLeave message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_CrossLeave message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_CrossLeave
     */
    static fromObject(object: { [k: string]: any }): P_CrossLeave;

    /**
     * Creates a plain object from a P_CrossLeave message. Also converts values to other types if specified.
     * @param message P_CrossLeave
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_CrossLeave, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_CrossLeave to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_CrossLeave
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_CrossLeave {

    /** Properties of a P_CrossLeave. */
    interface $Properties {

        /** P_CrossLeave role_uid */
        role_uid?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_CrossLeave. */
    type $Shape = P_CrossLeave.$Properties;
}

/**
 * Properties of a P_CrossQueryRole.
 * @deprecated Use P_CrossQueryRole.$Properties instead.
 */
export interface IP_CrossQueryRole extends P_CrossQueryRole.$Properties {
}

/** Represents a P_CrossQueryRole. */
export class P_CrossQueryRole {

    /**
     * Constructs a new P_CrossQueryRole.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_CrossQueryRole.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_CrossQueryRole role_uid. */
    role_uid?: (number|null);

    /**
     * Creates a new P_CrossQueryRole instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_CrossQueryRole instance
     */
    static create(properties: P_CrossQueryRole.$Shape): P_CrossQueryRole & P_CrossQueryRole.$Shape;
    static create(properties?: P_CrossQueryRole.$Properties): P_CrossQueryRole;

    /**
     * Encodes the specified P_CrossQueryRole message. Does not implicitly {@link P_CrossQueryRole.verify|verify} messages.
     * @param message P_CrossQueryRole message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_CrossQueryRole.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_CrossQueryRole message, length delimited. Does not implicitly {@link P_CrossQueryRole.verify|verify} messages.
     * @param message P_CrossQueryRole message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_CrossQueryRole.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_CrossQueryRole message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_CrossQueryRole & P_CrossQueryRole.$Shape} P_CrossQueryRole
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_CrossQueryRole & P_CrossQueryRole.$Shape;

    /**
     * Decodes a P_CrossQueryRole message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_CrossQueryRole & P_CrossQueryRole.$Shape} P_CrossQueryRole
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_CrossQueryRole & P_CrossQueryRole.$Shape;

    /**
     * Verifies a P_CrossQueryRole message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_CrossQueryRole message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_CrossQueryRole
     */
    static fromObject(object: { [k: string]: any }): P_CrossQueryRole;

    /**
     * Creates a plain object from a P_CrossQueryRole message. Also converts values to other types if specified.
     * @param message P_CrossQueryRole
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_CrossQueryRole, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_CrossQueryRole to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_CrossQueryRole
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_CrossQueryRole {

    /** Properties of a P_CrossQueryRole. */
    interface $Properties {

        /** P_CrossQueryRole role_uid */
        role_uid?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_CrossQueryRole. */
    type $Shape = P_CrossQueryRole.$Properties;
}

/**
 * Properties of a PB_MmoRoleData.
 * @deprecated Use PB_MmoRoleData.$Properties instead.
 */
export interface IPB_MmoRoleData extends PB_MmoRoleData.$Properties {
}

/** Represents a PB_MmoRoleData. */
export class PB_MmoRoleData {

    /**
     * Constructs a new PB_MmoRoleData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_MmoRoleData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_MmoRoleData scene_id. */
    scene_id?: (number|null);

    /** PB_MmoRoleData x. */
    x?: (number|null);

    /** PB_MmoRoleData y. */
    y?: (number|null);

    /** PB_MmoRoleData z. */
    z?: (number|null);

    /**
     * Creates a new PB_MmoRoleData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_MmoRoleData instance
     */
    static create(properties: PB_MmoRoleData.$Shape): PB_MmoRoleData & PB_MmoRoleData.$Shape;
    static create(properties?: PB_MmoRoleData.$Properties): PB_MmoRoleData;

    /**
     * Encodes the specified PB_MmoRoleData message. Does not implicitly {@link PB_MmoRoleData.verify|verify} messages.
     * @param message PB_MmoRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_MmoRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_MmoRoleData message, length delimited. Does not implicitly {@link PB_MmoRoleData.verify|verify} messages.
     * @param message PB_MmoRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_MmoRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_MmoRoleData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_MmoRoleData & PB_MmoRoleData.$Shape} PB_MmoRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_MmoRoleData & PB_MmoRoleData.$Shape;

    /**
     * Decodes a PB_MmoRoleData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_MmoRoleData & PB_MmoRoleData.$Shape} PB_MmoRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_MmoRoleData & PB_MmoRoleData.$Shape;

    /**
     * Verifies a PB_MmoRoleData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_MmoRoleData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_MmoRoleData
     */
    static fromObject(object: { [k: string]: any }): PB_MmoRoleData;

    /**
     * Creates a plain object from a PB_MmoRoleData message. Also converts values to other types if specified.
     * @param message PB_MmoRoleData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_MmoRoleData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_MmoRoleData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_MmoRoleData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_MmoRoleData {

    /** Properties of a PB_MmoRoleData. */
    interface $Properties {

        /** PB_MmoRoleData scene_id */
        scene_id?: (number|null);

        /** PB_MmoRoleData x */
        x?: (number|null);

        /** PB_MmoRoleData y */
        y?: (number|null);

        /** PB_MmoRoleData z */
        z?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_MmoRoleData. */
    type $Shape = PB_MmoRoleData.$Properties;
}

/**
 * Properties of a PB_MmoRoleInit.
 * @deprecated Use PB_MmoRoleInit.$Properties instead.
 */
export interface IPB_MmoRoleInit extends PB_MmoRoleInit.$Properties {
}

/** Represents a PB_MmoRoleInit. */
export class PB_MmoRoleInit {

    /**
     * Constructs a new PB_MmoRoleInit.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_MmoRoleInit.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_MmoRoleInit role_uid. */
    role_uid?: (number|null);

    /** PB_MmoRoleInit scene_id. */
    scene_id?: (number|null);

    /** PB_MmoRoleInit role_name. */
    role_name?: (string|null);

    /** PB_MmoRoleInit x. */
    x?: (number|null);

    /** PB_MmoRoleInit y. */
    y?: (number|null);

    /** PB_MmoRoleInit z. */
    z?: (number|null);

    /** PB_MmoRoleInit hero. */
    hero?: (PB_HeroData.$Properties|null);

    /**
     * Creates a new PB_MmoRoleInit instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_MmoRoleInit instance
     */
    static create(properties: PB_MmoRoleInit.$Shape): PB_MmoRoleInit & PB_MmoRoleInit.$Shape;
    static create(properties?: PB_MmoRoleInit.$Properties): PB_MmoRoleInit;

    /**
     * Encodes the specified PB_MmoRoleInit message. Does not implicitly {@link PB_MmoRoleInit.verify|verify} messages.
     * @param message PB_MmoRoleInit message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_MmoRoleInit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_MmoRoleInit message, length delimited. Does not implicitly {@link PB_MmoRoleInit.verify|verify} messages.
     * @param message PB_MmoRoleInit message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_MmoRoleInit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_MmoRoleInit message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_MmoRoleInit & PB_MmoRoleInit.$Shape} PB_MmoRoleInit
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_MmoRoleInit & PB_MmoRoleInit.$Shape;

    /**
     * Decodes a PB_MmoRoleInit message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_MmoRoleInit & PB_MmoRoleInit.$Shape} PB_MmoRoleInit
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_MmoRoleInit & PB_MmoRoleInit.$Shape;

    /**
     * Verifies a PB_MmoRoleInit message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_MmoRoleInit message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_MmoRoleInit
     */
    static fromObject(object: { [k: string]: any }): PB_MmoRoleInit;

    /**
     * Creates a plain object from a PB_MmoRoleInit message. Also converts values to other types if specified.
     * @param message PB_MmoRoleInit
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_MmoRoleInit, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_MmoRoleInit to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_MmoRoleInit
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_MmoRoleInit {

    /** Properties of a PB_MmoRoleInit. */
    interface $Properties {

        /** PB_MmoRoleInit role_uid */
        role_uid?: (number|null);

        /** PB_MmoRoleInit scene_id */
        scene_id?: (number|null);

        /** PB_MmoRoleInit role_name */
        role_name?: (string|null);

        /** PB_MmoRoleInit x */
        x?: (number|null);

        /** PB_MmoRoleInit y */
        y?: (number|null);

        /** PB_MmoRoleInit z */
        z?: (number|null);

        /** PB_MmoRoleInit hero */
        hero?: (PB_HeroData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_MmoRoleInit. */
    type $Shape = PB_MmoRoleInit.$Properties;
}

/**
 * Properties of a PB_MmoRoleState.
 * @deprecated Use PB_MmoRoleState.$Properties instead.
 */
export interface IPB_MmoRoleState extends PB_MmoRoleState.$Properties {
}

/** Represents a PB_MmoRoleState. */
export class PB_MmoRoleState {

    /**
     * Constructs a new PB_MmoRoleState.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_MmoRoleState.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_MmoRoleState role_uid. */
    role_uid?: (number|null);

    /** PB_MmoRoleState obj_id. */
    obj_id?: (number|null);

    /** PB_MmoRoleState scene_id. */
    scene_id?: (number|null);

    /** PB_MmoRoleState role_name. */
    role_name?: (string|null);

    /** PB_MmoRoleState hero_id. */
    hero_id?: (number|null);

    /** PB_MmoRoleState level. */
    level?: (number|null);

    /** PB_MmoRoleState hp. */
    hp?: (number|null);

    /** PB_MmoRoleState max_hp. */
    max_hp?: (number|null);

    /** PB_MmoRoleState dead. */
    dead?: (boolean|null);

    /**
     * Creates a new PB_MmoRoleState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_MmoRoleState instance
     */
    static create(properties: PB_MmoRoleState.$Shape): PB_MmoRoleState & PB_MmoRoleState.$Shape;
    static create(properties?: PB_MmoRoleState.$Properties): PB_MmoRoleState;

    /**
     * Encodes the specified PB_MmoRoleState message. Does not implicitly {@link PB_MmoRoleState.verify|verify} messages.
     * @param message PB_MmoRoleState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_MmoRoleState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_MmoRoleState message, length delimited. Does not implicitly {@link PB_MmoRoleState.verify|verify} messages.
     * @param message PB_MmoRoleState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_MmoRoleState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_MmoRoleState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_MmoRoleState & PB_MmoRoleState.$Shape} PB_MmoRoleState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_MmoRoleState & PB_MmoRoleState.$Shape;

    /**
     * Decodes a PB_MmoRoleState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_MmoRoleState & PB_MmoRoleState.$Shape} PB_MmoRoleState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_MmoRoleState & PB_MmoRoleState.$Shape;

    /**
     * Verifies a PB_MmoRoleState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_MmoRoleState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_MmoRoleState
     */
    static fromObject(object: { [k: string]: any }): PB_MmoRoleState;

    /**
     * Creates a plain object from a PB_MmoRoleState message. Also converts values to other types if specified.
     * @param message PB_MmoRoleState
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_MmoRoleState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_MmoRoleState to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_MmoRoleState
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_MmoRoleState {

    /** Properties of a PB_MmoRoleState. */
    interface $Properties {

        /** PB_MmoRoleState role_uid */
        role_uid?: (number|null);

        /** PB_MmoRoleState obj_id */
        obj_id?: (number|null);

        /** PB_MmoRoleState scene_id */
        scene_id?: (number|null);

        /** PB_MmoRoleState role_name */
        role_name?: (string|null);

        /** PB_MmoRoleState hero_id */
        hero_id?: (number|null);

        /** PB_MmoRoleState level */
        level?: (number|null);

        /** PB_MmoRoleState hp */
        hp?: (number|null);

        /** PB_MmoRoleState max_hp */
        max_hp?: (number|null);

        /** PB_MmoRoleState dead */
        dead?: (boolean|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_MmoRoleState. */
    type $Shape = PB_MmoRoleState.$Properties;
}

/**
 * Properties of a PB_MmoEvent.
 * @deprecated Use PB_MmoEvent.$Properties instead.
 */
export interface IPB_MmoEvent extends PB_MmoEvent.$Properties {
}

/** Represents a PB_MmoEvent. */
export class PB_MmoEvent {

    /**
     * Constructs a new PB_MmoEvent.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_MmoEvent.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_MmoEvent type. */
    type?: (number|null);

    /** PB_MmoEvent role_uid. */
    role_uid?: (number|null);

    /** PB_MmoEvent target_uid. */
    target_uid?: (number|null);

    /** PB_MmoEvent obj_id. */
    obj_id?: (number|null);

    /** PB_MmoEvent scene_id. */
    scene_id?: (number|null);

    /** PB_MmoEvent hero_id. */
    hero_id?: (number|null);

    /** PB_MmoEvent role_name. */
    role_name?: (string|null);

    /** PB_MmoEvent x. */
    x?: (number|null);

    /** PB_MmoEvent y. */
    y?: (number|null);

    /** PB_MmoEvent z. */
    z?: (number|null);

    /** PB_MmoEvent value. */
    value?: (number|null);

    /** PB_MmoEvent hp. */
    hp?: (number|null);

    /** PB_MmoEvent max_hp. */
    max_hp?: (number|null);

    /** PB_MmoEvent level. */
    level?: (number|null);

    /** PB_MmoEvent dead. */
    dead?: (boolean|null);

    /** PB_MmoEvent viewers. */
    viewers: number[];

    /**
     * Creates a new PB_MmoEvent instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_MmoEvent instance
     */
    static create(properties: PB_MmoEvent.$Shape): PB_MmoEvent & PB_MmoEvent.$Shape;
    static create(properties?: PB_MmoEvent.$Properties): PB_MmoEvent;

    /**
     * Encodes the specified PB_MmoEvent message. Does not implicitly {@link PB_MmoEvent.verify|verify} messages.
     * @param message PB_MmoEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_MmoEvent.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_MmoEvent message, length delimited. Does not implicitly {@link PB_MmoEvent.verify|verify} messages.
     * @param message PB_MmoEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_MmoEvent.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_MmoEvent message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_MmoEvent & PB_MmoEvent.$Shape} PB_MmoEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_MmoEvent & PB_MmoEvent.$Shape;

    /**
     * Decodes a PB_MmoEvent message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_MmoEvent & PB_MmoEvent.$Shape} PB_MmoEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_MmoEvent & PB_MmoEvent.$Shape;

    /**
     * Verifies a PB_MmoEvent message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_MmoEvent message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_MmoEvent
     */
    static fromObject(object: { [k: string]: any }): PB_MmoEvent;

    /**
     * Creates a plain object from a PB_MmoEvent message. Also converts values to other types if specified.
     * @param message PB_MmoEvent
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_MmoEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_MmoEvent to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_MmoEvent
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_MmoEvent {

    /** Properties of a PB_MmoEvent. */
    interface $Properties {

        /** PB_MmoEvent type */
        type?: (number|null);

        /** PB_MmoEvent role_uid */
        role_uid?: (number|null);

        /** PB_MmoEvent target_uid */
        target_uid?: (number|null);

        /** PB_MmoEvent obj_id */
        obj_id?: (number|null);

        /** PB_MmoEvent scene_id */
        scene_id?: (number|null);

        /** PB_MmoEvent hero_id */
        hero_id?: (number|null);

        /** PB_MmoEvent role_name */
        role_name?: (string|null);

        /** PB_MmoEvent x */
        x?: (number|null);

        /** PB_MmoEvent y */
        y?: (number|null);

        /** PB_MmoEvent z */
        z?: (number|null);

        /** PB_MmoEvent value */
        value?: (number|null);

        /** PB_MmoEvent hp */
        hp?: (number|null);

        /** PB_MmoEvent max_hp */
        max_hp?: (number|null);

        /** PB_MmoEvent level */
        level?: (number|null);

        /** PB_MmoEvent dead */
        dead?: (boolean|null);

        /** PB_MmoEvent viewers */
        viewers?: (number[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_MmoEvent. */
    type $Shape = PB_MmoEvent.$Properties;
}

/**
 * Properties of a PB_MessageHead.
 * @deprecated Use PB_MessageHead.$Properties instead.
 */
export interface IPB_MessageHead extends PB_MessageHead.$Properties {
}

/** Represents a PB_MessageHead. */
export class PB_MessageHead {

    /**
     * Constructs a new PB_MessageHead.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_MessageHead.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_MessageHead msg_type. */
    msg_type?: (number|null);

    /** PB_MessageHead param. */
    param: number[];

    /** PB_MessageHead token. */
    token?: (string|null);

    /**
     * Creates a new PB_MessageHead instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_MessageHead instance
     */
    static create(properties: PB_MessageHead.$Shape): PB_MessageHead & PB_MessageHead.$Shape;
    static create(properties?: PB_MessageHead.$Properties): PB_MessageHead;

    /**
     * Encodes the specified PB_MessageHead message. Does not implicitly {@link PB_MessageHead.verify|verify} messages.
     * @param message PB_MessageHead message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_MessageHead.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_MessageHead message, length delimited. Does not implicitly {@link PB_MessageHead.verify|verify} messages.
     * @param message PB_MessageHead message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_MessageHead.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_MessageHead message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_MessageHead & PB_MessageHead.$Shape} PB_MessageHead
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_MessageHead & PB_MessageHead.$Shape;

    /**
     * Decodes a PB_MessageHead message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_MessageHead & PB_MessageHead.$Shape} PB_MessageHead
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_MessageHead & PB_MessageHead.$Shape;

    /**
     * Verifies a PB_MessageHead message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_MessageHead message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_MessageHead
     */
    static fromObject(object: { [k: string]: any }): PB_MessageHead;

    /**
     * Creates a plain object from a PB_MessageHead message. Also converts values to other types if specified.
     * @param message PB_MessageHead
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_MessageHead, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_MessageHead to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_MessageHead
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_MessageHead {

    /** Properties of a PB_MessageHead. */
    interface $Properties {

        /** PB_MessageHead msg_type */
        msg_type?: (number|null);

        /** PB_MessageHead param */
        param?: (number[]|null);

        /** PB_MessageHead token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_MessageHead. */
    type $Shape = PB_MessageHead.$Properties;
}

/**
 * Properties of a P_ServerConnectResult.
 * @deprecated Use P_ServerConnectResult.$Properties instead.
 */
export interface IP_ServerConnectResult extends P_ServerConnectResult.$Properties {
}

/** Represents a P_ServerConnectResult. */
export class P_ServerConnectResult {

    /**
     * Constructs a new P_ServerConnectResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ServerConnectResult.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ServerConnectResult success. */
    success?: (boolean|null);

    /** P_ServerConnectResult error. */
    error?: (string|null);

    /** P_ServerConnectResult disconnect. */
    disconnect?: (boolean|null);

    /**
     * Creates a new P_ServerConnectResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ServerConnectResult instance
     */
    static create(properties: P_ServerConnectResult.$Shape): P_ServerConnectResult & P_ServerConnectResult.$Shape;
    static create(properties?: P_ServerConnectResult.$Properties): P_ServerConnectResult;

    /**
     * Encodes the specified P_ServerConnectResult message. Does not implicitly {@link P_ServerConnectResult.verify|verify} messages.
     * @param message P_ServerConnectResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ServerConnectResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ServerConnectResult message, length delimited. Does not implicitly {@link P_ServerConnectResult.verify|verify} messages.
     * @param message P_ServerConnectResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ServerConnectResult.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ServerConnectResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ServerConnectResult & P_ServerConnectResult.$Shape} P_ServerConnectResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ServerConnectResult & P_ServerConnectResult.$Shape;

    /**
     * Decodes a P_ServerConnectResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ServerConnectResult & P_ServerConnectResult.$Shape} P_ServerConnectResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ServerConnectResult & P_ServerConnectResult.$Shape;

    /**
     * Verifies a P_ServerConnectResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ServerConnectResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ServerConnectResult
     */
    static fromObject(object: { [k: string]: any }): P_ServerConnectResult;

    /**
     * Creates a plain object from a P_ServerConnectResult message. Also converts values to other types if specified.
     * @param message P_ServerConnectResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ServerConnectResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ServerConnectResult to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ServerConnectResult
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ServerConnectResult {

    /** Properties of a P_ServerConnectResult. */
    interface $Properties {

        /** P_ServerConnectResult success */
        success?: (boolean|null);

        /** P_ServerConnectResult error */
        error?: (string|null);

        /** P_ServerConnectResult disconnect */
        disconnect?: (boolean|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ServerConnectResult. */
    type $Shape = P_ServerConnectResult.$Properties;
}

/**
 * Properties of a P_DBHeartbeat.
 * @deprecated Use P_DBHeartbeat.$Properties instead.
 */
export interface IP_DBHeartbeat extends P_DBHeartbeat.$Properties {
}

/** Represents a P_DBHeartbeat. */
export class P_DBHeartbeat {

    /**
     * Constructs a new P_DBHeartbeat.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_DBHeartbeat.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_DBHeartbeat server_id. */
    server_id?: (number|null);

    /** P_DBHeartbeat time. */
    time?: (number|null);

    /**
     * Creates a new P_DBHeartbeat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_DBHeartbeat instance
     */
    static create(properties: P_DBHeartbeat.$Shape): P_DBHeartbeat & P_DBHeartbeat.$Shape;
    static create(properties?: P_DBHeartbeat.$Properties): P_DBHeartbeat;

    /**
     * Encodes the specified P_DBHeartbeat message. Does not implicitly {@link P_DBHeartbeat.verify|verify} messages.
     * @param message P_DBHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_DBHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_DBHeartbeat message, length delimited. Does not implicitly {@link P_DBHeartbeat.verify|verify} messages.
     * @param message P_DBHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_DBHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_DBHeartbeat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_DBHeartbeat & P_DBHeartbeat.$Shape} P_DBHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_DBHeartbeat & P_DBHeartbeat.$Shape;

    /**
     * Decodes a P_DBHeartbeat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_DBHeartbeat & P_DBHeartbeat.$Shape} P_DBHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_DBHeartbeat & P_DBHeartbeat.$Shape;

    /**
     * Verifies a P_DBHeartbeat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_DBHeartbeat message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_DBHeartbeat
     */
    static fromObject(object: { [k: string]: any }): P_DBHeartbeat;

    /**
     * Creates a plain object from a P_DBHeartbeat message. Also converts values to other types if specified.
     * @param message P_DBHeartbeat
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_DBHeartbeat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_DBHeartbeat to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_DBHeartbeat
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_DBHeartbeat {

    /** Properties of a P_DBHeartbeat. */
    interface $Properties {

        /** P_DBHeartbeat server_id */
        server_id?: (number|null);

        /** P_DBHeartbeat time */
        time?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_DBHeartbeat. */
    type $Shape = P_DBHeartbeat.$Properties;
}

/**
 * Properties of a P_ServerlDataDb_C.
 * @deprecated Use P_ServerlDataDb_C.$Properties instead.
 */
export interface IP_ServerlDataDb_C extends P_ServerlDataDb_C.$Properties {
}

/** Represents a P_ServerlDataDb_C. */
export class P_ServerlDataDb_C {

    /**
     * Constructs a new P_ServerlDataDb_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ServerlDataDb_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ServerlDataDb_C req_type. */
    req_type?: (number|null);

    /** P_ServerlDataDb_C server_global_data. */
    server_global_data?: (PB_ServerGlobalData.$Properties|null);

    /**
     * Creates a new P_ServerlDataDb_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ServerlDataDb_C instance
     */
    static create(properties: P_ServerlDataDb_C.$Shape): P_ServerlDataDb_C & P_ServerlDataDb_C.$Shape;
    static create(properties?: P_ServerlDataDb_C.$Properties): P_ServerlDataDb_C;

    /**
     * Encodes the specified P_ServerlDataDb_C message. Does not implicitly {@link P_ServerlDataDb_C.verify|verify} messages.
     * @param message P_ServerlDataDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ServerlDataDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ServerlDataDb_C message, length delimited. Does not implicitly {@link P_ServerlDataDb_C.verify|verify} messages.
     * @param message P_ServerlDataDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ServerlDataDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ServerlDataDb_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ServerlDataDb_C & P_ServerlDataDb_C.$Shape} P_ServerlDataDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ServerlDataDb_C & P_ServerlDataDb_C.$Shape;

    /**
     * Decodes a P_ServerlDataDb_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ServerlDataDb_C & P_ServerlDataDb_C.$Shape} P_ServerlDataDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ServerlDataDb_C & P_ServerlDataDb_C.$Shape;

    /**
     * Verifies a P_ServerlDataDb_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ServerlDataDb_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ServerlDataDb_C
     */
    static fromObject(object: { [k: string]: any }): P_ServerlDataDb_C;

    /**
     * Creates a plain object from a P_ServerlDataDb_C message. Also converts values to other types if specified.
     * @param message P_ServerlDataDb_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ServerlDataDb_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ServerlDataDb_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ServerlDataDb_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ServerlDataDb_C {

    /** Properties of a P_ServerlDataDb_C. */
    interface $Properties {

        /** P_ServerlDataDb_C req_type */
        req_type?: (number|null);

        /** P_ServerlDataDb_C server_global_data */
        server_global_data?: (PB_ServerGlobalData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ServerlDataDb_C. */
    type $Shape = P_ServerlDataDb_C.$Properties;
}

/**
 * Properties of a P_ServerlDataDb_S.
 * @deprecated Use P_ServerlDataDb_S.$Properties instead.
 */
export interface IP_ServerlDataDb_S extends P_ServerlDataDb_S.$Properties {
}

/** Represents a P_ServerlDataDb_S. */
export class P_ServerlDataDb_S {

    /**
     * Constructs a new P_ServerlDataDb_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ServerlDataDb_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ServerlDataDb_S req_type. */
    req_type?: (number|null);

    /** P_ServerlDataDb_S save_ret. */
    save_ret?: (number|null);

    /** P_ServerlDataDb_S server_global_data. */
    server_global_data?: (PB_ServerGlobalData.$Properties|null);

    /**
     * Creates a new P_ServerlDataDb_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ServerlDataDb_S instance
     */
    static create(properties: P_ServerlDataDb_S.$Shape): P_ServerlDataDb_S & P_ServerlDataDb_S.$Shape;
    static create(properties?: P_ServerlDataDb_S.$Properties): P_ServerlDataDb_S;

    /**
     * Encodes the specified P_ServerlDataDb_S message. Does not implicitly {@link P_ServerlDataDb_S.verify|verify} messages.
     * @param message P_ServerlDataDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ServerlDataDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ServerlDataDb_S message, length delimited. Does not implicitly {@link P_ServerlDataDb_S.verify|verify} messages.
     * @param message P_ServerlDataDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ServerlDataDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ServerlDataDb_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ServerlDataDb_S & P_ServerlDataDb_S.$Shape} P_ServerlDataDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ServerlDataDb_S & P_ServerlDataDb_S.$Shape;

    /**
     * Decodes a P_ServerlDataDb_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ServerlDataDb_S & P_ServerlDataDb_S.$Shape} P_ServerlDataDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ServerlDataDb_S & P_ServerlDataDb_S.$Shape;

    /**
     * Verifies a P_ServerlDataDb_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ServerlDataDb_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ServerlDataDb_S
     */
    static fromObject(object: { [k: string]: any }): P_ServerlDataDb_S;

    /**
     * Creates a plain object from a P_ServerlDataDb_S message. Also converts values to other types if specified.
     * @param message P_ServerlDataDb_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ServerlDataDb_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ServerlDataDb_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ServerlDataDb_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ServerlDataDb_S {

    /** Properties of a P_ServerlDataDb_S. */
    interface $Properties {

        /** P_ServerlDataDb_S req_type */
        req_type?: (number|null);

        /** P_ServerlDataDb_S save_ret */
        save_ret?: (number|null);

        /** P_ServerlDataDb_S server_global_data */
        server_global_data?: (PB_ServerGlobalData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ServerlDataDb_S. */
    type $Shape = P_ServerlDataDb_S.$Properties;
}

/**
 * Properties of a PB_GlobalDataDbNode.
 * @deprecated Use PB_GlobalDataDbNode.$Properties instead.
 */
export interface IPB_GlobalDataDbNode extends PB_GlobalDataDbNode.$Properties {
}

/** Represents a PB_GlobalDataDbNode. */
export class PB_GlobalDataDbNode {

    /**
     * Constructs a new PB_GlobalDataDbNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_GlobalDataDbNode.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_GlobalDataDbNode key. */
    key?: (string|null);

    /** PB_GlobalDataDbNode data. */
    data?: (string|null);

    /**
     * Creates a new PB_GlobalDataDbNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_GlobalDataDbNode instance
     */
    static create(properties: PB_GlobalDataDbNode.$Shape): PB_GlobalDataDbNode & PB_GlobalDataDbNode.$Shape;
    static create(properties?: PB_GlobalDataDbNode.$Properties): PB_GlobalDataDbNode;

    /**
     * Encodes the specified PB_GlobalDataDbNode message. Does not implicitly {@link PB_GlobalDataDbNode.verify|verify} messages.
     * @param message PB_GlobalDataDbNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_GlobalDataDbNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_GlobalDataDbNode message, length delimited. Does not implicitly {@link PB_GlobalDataDbNode.verify|verify} messages.
     * @param message PB_GlobalDataDbNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_GlobalDataDbNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_GlobalDataDbNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_GlobalDataDbNode & PB_GlobalDataDbNode.$Shape} PB_GlobalDataDbNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_GlobalDataDbNode & PB_GlobalDataDbNode.$Shape;

    /**
     * Decodes a PB_GlobalDataDbNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_GlobalDataDbNode & PB_GlobalDataDbNode.$Shape} PB_GlobalDataDbNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_GlobalDataDbNode & PB_GlobalDataDbNode.$Shape;

    /**
     * Verifies a PB_GlobalDataDbNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_GlobalDataDbNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_GlobalDataDbNode
     */
    static fromObject(object: { [k: string]: any }): PB_GlobalDataDbNode;

    /**
     * Creates a plain object from a PB_GlobalDataDbNode message. Also converts values to other types if specified.
     * @param message PB_GlobalDataDbNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_GlobalDataDbNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_GlobalDataDbNode to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_GlobalDataDbNode
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_GlobalDataDbNode {

    /** Properties of a PB_GlobalDataDbNode. */
    interface $Properties {

        /** PB_GlobalDataDbNode key */
        key?: (string|null);

        /** PB_GlobalDataDbNode data */
        data?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_GlobalDataDbNode. */
    type $Shape = PB_GlobalDataDbNode.$Properties;
}

/**
 * Properties of a P_GlobalDataDb_C.
 * @deprecated Use P_GlobalDataDb_C.$Properties instead.
 */
export interface IP_GlobalDataDb_C extends P_GlobalDataDb_C.$Properties {
}

/** Represents a P_GlobalDataDb_C. */
export class P_GlobalDataDb_C {

    /**
     * Constructs a new P_GlobalDataDb_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_GlobalDataDb_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_GlobalDataDb_C req_type. */
    req_type?: (number|null);

    /** P_GlobalDataDb_C datas. */
    datas: PB_GlobalDataDbNode.$Properties[];

    /**
     * Creates a new P_GlobalDataDb_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_GlobalDataDb_C instance
     */
    static create(properties: P_GlobalDataDb_C.$Shape): P_GlobalDataDb_C & P_GlobalDataDb_C.$Shape;
    static create(properties?: P_GlobalDataDb_C.$Properties): P_GlobalDataDb_C;

    /**
     * Encodes the specified P_GlobalDataDb_C message. Does not implicitly {@link P_GlobalDataDb_C.verify|verify} messages.
     * @param message P_GlobalDataDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_GlobalDataDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_GlobalDataDb_C message, length delimited. Does not implicitly {@link P_GlobalDataDb_C.verify|verify} messages.
     * @param message P_GlobalDataDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_GlobalDataDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_GlobalDataDb_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_GlobalDataDb_C & P_GlobalDataDb_C.$Shape} P_GlobalDataDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_GlobalDataDb_C & P_GlobalDataDb_C.$Shape;

    /**
     * Decodes a P_GlobalDataDb_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_GlobalDataDb_C & P_GlobalDataDb_C.$Shape} P_GlobalDataDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_GlobalDataDb_C & P_GlobalDataDb_C.$Shape;

    /**
     * Verifies a P_GlobalDataDb_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_GlobalDataDb_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_GlobalDataDb_C
     */
    static fromObject(object: { [k: string]: any }): P_GlobalDataDb_C;

    /**
     * Creates a plain object from a P_GlobalDataDb_C message. Also converts values to other types if specified.
     * @param message P_GlobalDataDb_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_GlobalDataDb_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_GlobalDataDb_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_GlobalDataDb_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_GlobalDataDb_C {

    /** Properties of a P_GlobalDataDb_C. */
    interface $Properties {

        /** P_GlobalDataDb_C req_type */
        req_type?: (number|null);

        /** P_GlobalDataDb_C datas */
        datas?: (PB_GlobalDataDbNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_GlobalDataDb_C. */
    type $Shape = P_GlobalDataDb_C.$Properties;
}

/**
 * Properties of a P_GlobalDataDb_S.
 * @deprecated Use P_GlobalDataDb_S.$Properties instead.
 */
export interface IP_GlobalDataDb_S extends P_GlobalDataDb_S.$Properties {
}

/** Represents a P_GlobalDataDb_S. */
export class P_GlobalDataDb_S {

    /**
     * Constructs a new P_GlobalDataDb_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_GlobalDataDb_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_GlobalDataDb_S req_type. */
    req_type?: (number|null);

    /** P_GlobalDataDb_S datas. */
    datas: PB_GlobalDataDbNode.$Properties[];

    /**
     * Creates a new P_GlobalDataDb_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_GlobalDataDb_S instance
     */
    static create(properties: P_GlobalDataDb_S.$Shape): P_GlobalDataDb_S & P_GlobalDataDb_S.$Shape;
    static create(properties?: P_GlobalDataDb_S.$Properties): P_GlobalDataDb_S;

    /**
     * Encodes the specified P_GlobalDataDb_S message. Does not implicitly {@link P_GlobalDataDb_S.verify|verify} messages.
     * @param message P_GlobalDataDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_GlobalDataDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_GlobalDataDb_S message, length delimited. Does not implicitly {@link P_GlobalDataDb_S.verify|verify} messages.
     * @param message P_GlobalDataDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_GlobalDataDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_GlobalDataDb_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_GlobalDataDb_S & P_GlobalDataDb_S.$Shape} P_GlobalDataDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_GlobalDataDb_S & P_GlobalDataDb_S.$Shape;

    /**
     * Decodes a P_GlobalDataDb_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_GlobalDataDb_S & P_GlobalDataDb_S.$Shape} P_GlobalDataDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_GlobalDataDb_S & P_GlobalDataDb_S.$Shape;

    /**
     * Verifies a P_GlobalDataDb_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_GlobalDataDb_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_GlobalDataDb_S
     */
    static fromObject(object: { [k: string]: any }): P_GlobalDataDb_S;

    /**
     * Creates a plain object from a P_GlobalDataDb_S message. Also converts values to other types if specified.
     * @param message P_GlobalDataDb_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_GlobalDataDb_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_GlobalDataDb_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_GlobalDataDb_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_GlobalDataDb_S {

    /** Properties of a P_GlobalDataDb_S. */
    interface $Properties {

        /** P_GlobalDataDb_S req_type */
        req_type?: (number|null);

        /** P_GlobalDataDb_S datas */
        datas?: (PB_GlobalDataDbNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_GlobalDataDb_S. */
    type $Shape = P_GlobalDataDb_S.$Properties;
}

/**
 * Properties of a PB_ArenaDbNode.
 * @deprecated Use PB_ArenaDbNode.$Properties instead.
 */
export interface IPB_ArenaDbNode extends PB_ArenaDbNode.$Properties {
}

/** Represents a PB_ArenaDbNode. */
export class PB_ArenaDbNode {

    /**
     * Constructs a new PB_ArenaDbNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ArenaDbNode.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ArenaDbNode uid. */
    uid?: (number|null);

    /** PB_ArenaDbNode score. */
    score?: (number|null);

    /** PB_ArenaDbNode data. */
    data?: (string|null);

    /**
     * Creates a new PB_ArenaDbNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ArenaDbNode instance
     */
    static create(properties: PB_ArenaDbNode.$Shape): PB_ArenaDbNode & PB_ArenaDbNode.$Shape;
    static create(properties?: PB_ArenaDbNode.$Properties): PB_ArenaDbNode;

    /**
     * Encodes the specified PB_ArenaDbNode message. Does not implicitly {@link PB_ArenaDbNode.verify|verify} messages.
     * @param message PB_ArenaDbNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ArenaDbNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ArenaDbNode message, length delimited. Does not implicitly {@link PB_ArenaDbNode.verify|verify} messages.
     * @param message PB_ArenaDbNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ArenaDbNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ArenaDbNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ArenaDbNode & PB_ArenaDbNode.$Shape} PB_ArenaDbNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ArenaDbNode & PB_ArenaDbNode.$Shape;

    /**
     * Decodes a PB_ArenaDbNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ArenaDbNode & PB_ArenaDbNode.$Shape} PB_ArenaDbNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ArenaDbNode & PB_ArenaDbNode.$Shape;

    /**
     * Verifies a PB_ArenaDbNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ArenaDbNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ArenaDbNode
     */
    static fromObject(object: { [k: string]: any }): PB_ArenaDbNode;

    /**
     * Creates a plain object from a PB_ArenaDbNode message. Also converts values to other types if specified.
     * @param message PB_ArenaDbNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ArenaDbNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ArenaDbNode to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ArenaDbNode
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ArenaDbNode {

    /** Properties of a PB_ArenaDbNode. */
    interface $Properties {

        /** PB_ArenaDbNode uid */
        uid?: (number|null);

        /** PB_ArenaDbNode score */
        score?: (number|null);

        /** PB_ArenaDbNode data */
        data?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ArenaDbNode. */
    type $Shape = PB_ArenaDbNode.$Properties;
}

/**
 * Properties of a P_ArenaDb_C.
 * @deprecated Use P_ArenaDb_C.$Properties instead.
 */
export interface IP_ArenaDb_C extends P_ArenaDb_C.$Properties {
}

/** Represents a P_ArenaDb_C. */
export class P_ArenaDb_C {

    /**
     * Constructs a new P_ArenaDb_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ArenaDb_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ArenaDb_C req_type. */
    req_type?: (number|null);

    /** P_ArenaDb_C datas. */
    datas: PB_ArenaDbNode.$Properties[];

    /**
     * Creates a new P_ArenaDb_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ArenaDb_C instance
     */
    static create(properties: P_ArenaDb_C.$Shape): P_ArenaDb_C & P_ArenaDb_C.$Shape;
    static create(properties?: P_ArenaDb_C.$Properties): P_ArenaDb_C;

    /**
     * Encodes the specified P_ArenaDb_C message. Does not implicitly {@link P_ArenaDb_C.verify|verify} messages.
     * @param message P_ArenaDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ArenaDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ArenaDb_C message, length delimited. Does not implicitly {@link P_ArenaDb_C.verify|verify} messages.
     * @param message P_ArenaDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ArenaDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ArenaDb_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ArenaDb_C & P_ArenaDb_C.$Shape} P_ArenaDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ArenaDb_C & P_ArenaDb_C.$Shape;

    /**
     * Decodes a P_ArenaDb_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ArenaDb_C & P_ArenaDb_C.$Shape} P_ArenaDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ArenaDb_C & P_ArenaDb_C.$Shape;

    /**
     * Verifies a P_ArenaDb_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ArenaDb_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ArenaDb_C
     */
    static fromObject(object: { [k: string]: any }): P_ArenaDb_C;

    /**
     * Creates a plain object from a P_ArenaDb_C message. Also converts values to other types if specified.
     * @param message P_ArenaDb_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ArenaDb_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ArenaDb_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ArenaDb_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ArenaDb_C {

    /** Properties of a P_ArenaDb_C. */
    interface $Properties {

        /** P_ArenaDb_C req_type */
        req_type?: (number|null);

        /** P_ArenaDb_C datas */
        datas?: (PB_ArenaDbNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ArenaDb_C. */
    type $Shape = P_ArenaDb_C.$Properties;
}

/**
 * Properties of a P_ArenaDb_S.
 * @deprecated Use P_ArenaDb_S.$Properties instead.
 */
export interface IP_ArenaDb_S extends P_ArenaDb_S.$Properties {
}

/** Represents a P_ArenaDb_S. */
export class P_ArenaDb_S {

    /**
     * Constructs a new P_ArenaDb_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ArenaDb_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ArenaDb_S req_type. */
    req_type?: (number|null);

    /** P_ArenaDb_S save_ret. */
    save_ret?: (number|null);

    /** P_ArenaDb_S datas. */
    datas: PB_ArenaDbNode.$Properties[];

    /**
     * Creates a new P_ArenaDb_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ArenaDb_S instance
     */
    static create(properties: P_ArenaDb_S.$Shape): P_ArenaDb_S & P_ArenaDb_S.$Shape;
    static create(properties?: P_ArenaDb_S.$Properties): P_ArenaDb_S;

    /**
     * Encodes the specified P_ArenaDb_S message. Does not implicitly {@link P_ArenaDb_S.verify|verify} messages.
     * @param message P_ArenaDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ArenaDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ArenaDb_S message, length delimited. Does not implicitly {@link P_ArenaDb_S.verify|verify} messages.
     * @param message P_ArenaDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ArenaDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ArenaDb_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ArenaDb_S & P_ArenaDb_S.$Shape} P_ArenaDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ArenaDb_S & P_ArenaDb_S.$Shape;

    /**
     * Decodes a P_ArenaDb_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ArenaDb_S & P_ArenaDb_S.$Shape} P_ArenaDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ArenaDb_S & P_ArenaDb_S.$Shape;

    /**
     * Verifies a P_ArenaDb_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ArenaDb_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ArenaDb_S
     */
    static fromObject(object: { [k: string]: any }): P_ArenaDb_S;

    /**
     * Creates a plain object from a P_ArenaDb_S message. Also converts values to other types if specified.
     * @param message P_ArenaDb_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ArenaDb_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ArenaDb_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ArenaDb_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ArenaDb_S {

    /** Properties of a P_ArenaDb_S. */
    interface $Properties {

        /** P_ArenaDb_S req_type */
        req_type?: (number|null);

        /** P_ArenaDb_S save_ret */
        save_ret?: (number|null);

        /** P_ArenaDb_S datas */
        datas?: (PB_ArenaDbNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ArenaDb_S. */
    type $Shape = P_ArenaDb_S.$Properties;
}

/**
 * Properties of a PB_RankDbNode.
 * @deprecated Use PB_RankDbNode.$Properties instead.
 */
export interface IPB_RankDbNode extends PB_RankDbNode.$Properties {
}

/** Represents a PB_RankDbNode. */
export class PB_RankDbNode {

    /**
     * Constructs a new PB_RankDbNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_RankDbNode.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_RankDbNode uid. */
    uid?: (number|null);

    /** PB_RankDbNode name. */
    name?: (string|null);

    /** PB_RankDbNode value. */
    value?: (number|null);

    /** PB_RankDbNode param1. */
    param1?: (number|null);

    /** PB_RankDbNode param2. */
    param2?: (number|null);

    /** PB_RankDbNode param3. */
    param3?: (number|null);

    /** PB_RankDbNode update_time. */
    update_time?: (number|null);

    /** PB_RankDbNode data. */
    data?: (string|null);

    /**
     * Creates a new PB_RankDbNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_RankDbNode instance
     */
    static create(properties: PB_RankDbNode.$Shape): PB_RankDbNode & PB_RankDbNode.$Shape;
    static create(properties?: PB_RankDbNode.$Properties): PB_RankDbNode;

    /**
     * Encodes the specified PB_RankDbNode message. Does not implicitly {@link PB_RankDbNode.verify|verify} messages.
     * @param message PB_RankDbNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_RankDbNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_RankDbNode message, length delimited. Does not implicitly {@link PB_RankDbNode.verify|verify} messages.
     * @param message PB_RankDbNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_RankDbNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_RankDbNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_RankDbNode & PB_RankDbNode.$Shape} PB_RankDbNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_RankDbNode & PB_RankDbNode.$Shape;

    /**
     * Decodes a PB_RankDbNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_RankDbNode & PB_RankDbNode.$Shape} PB_RankDbNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_RankDbNode & PB_RankDbNode.$Shape;

    /**
     * Verifies a PB_RankDbNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_RankDbNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_RankDbNode
     */
    static fromObject(object: { [k: string]: any }): PB_RankDbNode;

    /**
     * Creates a plain object from a PB_RankDbNode message. Also converts values to other types if specified.
     * @param message PB_RankDbNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_RankDbNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_RankDbNode to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_RankDbNode
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_RankDbNode {

    /** Properties of a PB_RankDbNode. */
    interface $Properties {

        /** PB_RankDbNode uid */
        uid?: (number|null);

        /** PB_RankDbNode name */
        name?: (string|null);

        /** PB_RankDbNode value */
        value?: (number|null);

        /** PB_RankDbNode param1 */
        param1?: (number|null);

        /** PB_RankDbNode param2 */
        param2?: (number|null);

        /** PB_RankDbNode param3 */
        param3?: (number|null);

        /** PB_RankDbNode update_time */
        update_time?: (number|null);

        /** PB_RankDbNode data */
        data?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_RankDbNode. */
    type $Shape = PB_RankDbNode.$Properties;
}

/**
 * Properties of a P_RankDb_C.
 * @deprecated Use P_RankDb_C.$Properties instead.
 */
export interface IP_RankDb_C extends P_RankDb_C.$Properties {
}

/** Represents a P_RankDb_C. */
export class P_RankDb_C {

    /**
     * Constructs a new P_RankDb_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_RankDb_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_RankDb_C req_type. */
    req_type?: (number|null);

    /** P_RankDb_C rank_type. */
    rank_type?: (number|null);

    /** P_RankDb_C datas. */
    datas: PB_RankDbNode.$Properties[];

    /**
     * Creates a new P_RankDb_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_RankDb_C instance
     */
    static create(properties: P_RankDb_C.$Shape): P_RankDb_C & P_RankDb_C.$Shape;
    static create(properties?: P_RankDb_C.$Properties): P_RankDb_C;

    /**
     * Encodes the specified P_RankDb_C message. Does not implicitly {@link P_RankDb_C.verify|verify} messages.
     * @param message P_RankDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_RankDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_RankDb_C message, length delimited. Does not implicitly {@link P_RankDb_C.verify|verify} messages.
     * @param message P_RankDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_RankDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_RankDb_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_RankDb_C & P_RankDb_C.$Shape} P_RankDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_RankDb_C & P_RankDb_C.$Shape;

    /**
     * Decodes a P_RankDb_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_RankDb_C & P_RankDb_C.$Shape} P_RankDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_RankDb_C & P_RankDb_C.$Shape;

    /**
     * Verifies a P_RankDb_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_RankDb_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_RankDb_C
     */
    static fromObject(object: { [k: string]: any }): P_RankDb_C;

    /**
     * Creates a plain object from a P_RankDb_C message. Also converts values to other types if specified.
     * @param message P_RankDb_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_RankDb_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_RankDb_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_RankDb_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_RankDb_C {

    /** Properties of a P_RankDb_C. */
    interface $Properties {

        /** P_RankDb_C req_type */
        req_type?: (number|null);

        /** P_RankDb_C rank_type */
        rank_type?: (number|null);

        /** P_RankDb_C datas */
        datas?: (PB_RankDbNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_RankDb_C. */
    type $Shape = P_RankDb_C.$Properties;
}

/**
 * Properties of a P_RankDb_S.
 * @deprecated Use P_RankDb_S.$Properties instead.
 */
export interface IP_RankDb_S extends P_RankDb_S.$Properties {
}

/** Represents a P_RankDb_S. */
export class P_RankDb_S {

    /**
     * Constructs a new P_RankDb_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_RankDb_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_RankDb_S req_type. */
    req_type?: (number|null);

    /** P_RankDb_S save_ret. */
    save_ret?: (number|null);

    /** P_RankDb_S rank_type. */
    rank_type?: (number|null);

    /** P_RankDb_S datas. */
    datas: PB_RankDbNode.$Properties[];

    /**
     * Creates a new P_RankDb_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_RankDb_S instance
     */
    static create(properties: P_RankDb_S.$Shape): P_RankDb_S & P_RankDb_S.$Shape;
    static create(properties?: P_RankDb_S.$Properties): P_RankDb_S;

    /**
     * Encodes the specified P_RankDb_S message. Does not implicitly {@link P_RankDb_S.verify|verify} messages.
     * @param message P_RankDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_RankDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_RankDb_S message, length delimited. Does not implicitly {@link P_RankDb_S.verify|verify} messages.
     * @param message P_RankDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_RankDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_RankDb_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_RankDb_S & P_RankDb_S.$Shape} P_RankDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_RankDb_S & P_RankDb_S.$Shape;

    /**
     * Decodes a P_RankDb_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_RankDb_S & P_RankDb_S.$Shape} P_RankDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_RankDb_S & P_RankDb_S.$Shape;

    /**
     * Verifies a P_RankDb_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_RankDb_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_RankDb_S
     */
    static fromObject(object: { [k: string]: any }): P_RankDb_S;

    /**
     * Creates a plain object from a P_RankDb_S message. Also converts values to other types if specified.
     * @param message P_RankDb_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_RankDb_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_RankDb_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_RankDb_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_RankDb_S {

    /** Properties of a P_RankDb_S. */
    interface $Properties {

        /** P_RankDb_S req_type */
        req_type?: (number|null);

        /** P_RankDb_S save_ret */
        save_ret?: (number|null);

        /** P_RankDb_S rank_type */
        rank_type?: (number|null);

        /** P_RankDb_S datas */
        datas?: (PB_RankDbNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_RankDb_S. */
    type $Shape = P_RankDb_S.$Properties;
}

/** PE_ACTIVITY_STATE_DB_REQ_TYPE enum. */
export enum PE_ACTIVITY_STATE_DB_REQ_TYPE {

    /** PE_ACTIVITY_STATE_DB_REQ_LOAD value */
    PE_ACTIVITY_STATE_DB_REQ_LOAD = 0,

    /** PE_ACTIVITY_STATE_DB_REQ_SAVE value */
    PE_ACTIVITY_STATE_DB_REQ_SAVE = 1
}

/**
 * Properties of a P_ActivityStateDb_C.
 * @deprecated Use P_ActivityStateDb_C.$Properties instead.
 */
export interface IP_ActivityStateDb_C extends P_ActivityStateDb_C.$Properties {
}

/** Represents a P_ActivityStateDb_C. */
export class P_ActivityStateDb_C {

    /**
     * Constructs a new P_ActivityStateDb_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ActivityStateDb_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ActivityStateDb_C req_type. */
    req_type?: (number|null);

    /** P_ActivityStateDb_C server_id. */
    server_id?: (number|null);

    /** P_ActivityStateDb_C states. */
    states: PB_ActivityState.$Properties[];

    /**
     * Creates a new P_ActivityStateDb_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ActivityStateDb_C instance
     */
    static create(properties: P_ActivityStateDb_C.$Shape): P_ActivityStateDb_C & P_ActivityStateDb_C.$Shape;
    static create(properties?: P_ActivityStateDb_C.$Properties): P_ActivityStateDb_C;

    /**
     * Encodes the specified P_ActivityStateDb_C message. Does not implicitly {@link P_ActivityStateDb_C.verify|verify} messages.
     * @param message P_ActivityStateDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ActivityStateDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ActivityStateDb_C message, length delimited. Does not implicitly {@link P_ActivityStateDb_C.verify|verify} messages.
     * @param message P_ActivityStateDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ActivityStateDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ActivityStateDb_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ActivityStateDb_C & P_ActivityStateDb_C.$Shape} P_ActivityStateDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ActivityStateDb_C & P_ActivityStateDb_C.$Shape;

    /**
     * Decodes a P_ActivityStateDb_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ActivityStateDb_C & P_ActivityStateDb_C.$Shape} P_ActivityStateDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ActivityStateDb_C & P_ActivityStateDb_C.$Shape;

    /**
     * Verifies a P_ActivityStateDb_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ActivityStateDb_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ActivityStateDb_C
     */
    static fromObject(object: { [k: string]: any }): P_ActivityStateDb_C;

    /**
     * Creates a plain object from a P_ActivityStateDb_C message. Also converts values to other types if specified.
     * @param message P_ActivityStateDb_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ActivityStateDb_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ActivityStateDb_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ActivityStateDb_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ActivityStateDb_C {

    /** Properties of a P_ActivityStateDb_C. */
    interface $Properties {

        /** P_ActivityStateDb_C req_type */
        req_type?: (number|null);

        /** P_ActivityStateDb_C server_id */
        server_id?: (number|null);

        /** P_ActivityStateDb_C states */
        states?: (PB_ActivityState.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ActivityStateDb_C. */
    type $Shape = P_ActivityStateDb_C.$Properties;
}

/**
 * Properties of a P_ActivityStateDb_S.
 * @deprecated Use P_ActivityStateDb_S.$Properties instead.
 */
export interface IP_ActivityStateDb_S extends P_ActivityStateDb_S.$Properties {
}

/** Represents a P_ActivityStateDb_S. */
export class P_ActivityStateDb_S {

    /**
     * Constructs a new P_ActivityStateDb_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ActivityStateDb_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ActivityStateDb_S req_type. */
    req_type?: (number|null);

    /** P_ActivityStateDb_S ret. */
    ret?: (number|null);

    /** P_ActivityStateDb_S server_id. */
    server_id?: (number|null);

    /** P_ActivityStateDb_S states. */
    states: PB_ActivityState.$Properties[];

    /**
     * Creates a new P_ActivityStateDb_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ActivityStateDb_S instance
     */
    static create(properties: P_ActivityStateDb_S.$Shape): P_ActivityStateDb_S & P_ActivityStateDb_S.$Shape;
    static create(properties?: P_ActivityStateDb_S.$Properties): P_ActivityStateDb_S;

    /**
     * Encodes the specified P_ActivityStateDb_S message. Does not implicitly {@link P_ActivityStateDb_S.verify|verify} messages.
     * @param message P_ActivityStateDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ActivityStateDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ActivityStateDb_S message, length delimited. Does not implicitly {@link P_ActivityStateDb_S.verify|verify} messages.
     * @param message P_ActivityStateDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ActivityStateDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ActivityStateDb_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ActivityStateDb_S & P_ActivityStateDb_S.$Shape} P_ActivityStateDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ActivityStateDb_S & P_ActivityStateDb_S.$Shape;

    /**
     * Decodes a P_ActivityStateDb_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ActivityStateDb_S & P_ActivityStateDb_S.$Shape} P_ActivityStateDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ActivityStateDb_S & P_ActivityStateDb_S.$Shape;

    /**
     * Verifies a P_ActivityStateDb_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ActivityStateDb_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ActivityStateDb_S
     */
    static fromObject(object: { [k: string]: any }): P_ActivityStateDb_S;

    /**
     * Creates a plain object from a P_ActivityStateDb_S message. Also converts values to other types if specified.
     * @param message P_ActivityStateDb_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ActivityStateDb_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ActivityStateDb_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ActivityStateDb_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ActivityStateDb_S {

    /** Properties of a P_ActivityStateDb_S. */
    interface $Properties {

        /** P_ActivityStateDb_S req_type */
        req_type?: (number|null);

        /** P_ActivityStateDb_S ret */
        ret?: (number|null);

        /** P_ActivityStateDb_S server_id */
        server_id?: (number|null);

        /** P_ActivityStateDb_S states */
        states?: (PB_ActivityState.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ActivityStateDb_S. */
    type $Shape = P_ActivityStateDb_S.$Properties;
}

/** PSAVEROLEDATA_C enum. */
export enum PSAVEROLEDATA_C {

    /** PE_SAVE_TYPE_CREATE value */
    PE_SAVE_TYPE_CREATE = 0,

    /** PE_SAVE_TYPE_UPDATE value */
    PE_SAVE_TYPE_UPDATE = 1,

    /** PE_SAVE_TYPE_UPDATE_CACHE value */
    PE_SAVE_TYPE_UPDATE_CACHE = 2
}

/**
 * Properties of a P_SaveRoleData_C.
 * @deprecated Use P_SaveRoleData_C.$Properties instead.
 */
export interface IP_SaveRoleData_C extends P_SaveRoleData_C.$Properties {
}

/** Represents a P_SaveRoleData_C. */
export class P_SaveRoleData_C {

    /**
     * Constructs a new P_SaveRoleData_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SaveRoleData_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SaveRoleData_C req_type. */
    req_type?: (number|null);

    /** P_SaveRoleData_C netid. */
    netid?: (number|null);

    /** P_SaveRoleData_C role_data. */
    role_data?: (PB_RoleData.$Properties|null);

    /** P_SaveRoleData_C server_id. */
    server_id?: (number|null);

    /**
     * Creates a new P_SaveRoleData_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SaveRoleData_C instance
     */
    static create(properties: P_SaveRoleData_C.$Shape): P_SaveRoleData_C & P_SaveRoleData_C.$Shape;
    static create(properties?: P_SaveRoleData_C.$Properties): P_SaveRoleData_C;

    /**
     * Encodes the specified P_SaveRoleData_C message. Does not implicitly {@link P_SaveRoleData_C.verify|verify} messages.
     * @param message P_SaveRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SaveRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SaveRoleData_C message, length delimited. Does not implicitly {@link P_SaveRoleData_C.verify|verify} messages.
     * @param message P_SaveRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SaveRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SaveRoleData_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SaveRoleData_C & P_SaveRoleData_C.$Shape} P_SaveRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SaveRoleData_C & P_SaveRoleData_C.$Shape;

    /**
     * Decodes a P_SaveRoleData_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SaveRoleData_C & P_SaveRoleData_C.$Shape} P_SaveRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SaveRoleData_C & P_SaveRoleData_C.$Shape;

    /**
     * Verifies a P_SaveRoleData_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SaveRoleData_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SaveRoleData_C
     */
    static fromObject(object: { [k: string]: any }): P_SaveRoleData_C;

    /**
     * Creates a plain object from a P_SaveRoleData_C message. Also converts values to other types if specified.
     * @param message P_SaveRoleData_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SaveRoleData_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SaveRoleData_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SaveRoleData_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SaveRoleData_C {

    /** Properties of a P_SaveRoleData_C. */
    interface $Properties {

        /** P_SaveRoleData_C req_type */
        req_type?: (number|null);

        /** P_SaveRoleData_C netid */
        netid?: (number|null);

        /** P_SaveRoleData_C role_data */
        role_data?: (PB_RoleData.$Properties|null);

        /** P_SaveRoleData_C server_id */
        server_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SaveRoleData_C. */
    type $Shape = P_SaveRoleData_C.$Properties;
}

/**
 * Properties of a P_SaveRoleData_S.
 * @deprecated Use P_SaveRoleData_S.$Properties instead.
 */
export interface IP_SaveRoleData_S extends P_SaveRoleData_S.$Properties {
}

/** Represents a P_SaveRoleData_S. */
export class P_SaveRoleData_S {

    /**
     * Constructs a new P_SaveRoleData_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SaveRoleData_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SaveRoleData_S req_type. */
    req_type?: (number|null);

    /** P_SaveRoleData_S netid. */
    netid?: (number|null);

    /** P_SaveRoleData_S ret. */
    ret?: (number|null);

    /** P_SaveRoleData_S create_role_data. */
    create_role_data?: (PB_RoleData.$Properties|null);

    /**
     * Creates a new P_SaveRoleData_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SaveRoleData_S instance
     */
    static create(properties: P_SaveRoleData_S.$Shape): P_SaveRoleData_S & P_SaveRoleData_S.$Shape;
    static create(properties?: P_SaveRoleData_S.$Properties): P_SaveRoleData_S;

    /**
     * Encodes the specified P_SaveRoleData_S message. Does not implicitly {@link P_SaveRoleData_S.verify|verify} messages.
     * @param message P_SaveRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SaveRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SaveRoleData_S message, length delimited. Does not implicitly {@link P_SaveRoleData_S.verify|verify} messages.
     * @param message P_SaveRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SaveRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SaveRoleData_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SaveRoleData_S & P_SaveRoleData_S.$Shape} P_SaveRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SaveRoleData_S & P_SaveRoleData_S.$Shape;

    /**
     * Decodes a P_SaveRoleData_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SaveRoleData_S & P_SaveRoleData_S.$Shape} P_SaveRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SaveRoleData_S & P_SaveRoleData_S.$Shape;

    /**
     * Verifies a P_SaveRoleData_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SaveRoleData_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SaveRoleData_S
     */
    static fromObject(object: { [k: string]: any }): P_SaveRoleData_S;

    /**
     * Creates a plain object from a P_SaveRoleData_S message. Also converts values to other types if specified.
     * @param message P_SaveRoleData_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SaveRoleData_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SaveRoleData_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SaveRoleData_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SaveRoleData_S {

    /** Properties of a P_SaveRoleData_S. */
    interface $Properties {

        /** P_SaveRoleData_S req_type */
        req_type?: (number|null);

        /** P_SaveRoleData_S netid */
        netid?: (number|null);

        /** P_SaveRoleData_S ret */
        ret?: (number|null);

        /** P_SaveRoleData_S create_role_data */
        create_role_data?: (PB_RoleData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SaveRoleData_S. */
    type $Shape = P_SaveRoleData_S.$Properties;
}

/** PINITROLEDATA_C enum. */
export enum PINITROLEDATA_C {

    /** PE_INIT_TYPE_INIT value */
    PE_INIT_TYPE_INIT = 0,

    /** PE_INIT_TYPE_LOGIN value */
    PE_INIT_TYPE_LOGIN = 1,

    /** PE_INIT_TYPE_FIND value */
    PE_INIT_TYPE_FIND = 2
}

/**
 * Properties of a P_InitRoleData_C.
 * @deprecated Use P_InitRoleData_C.$Properties instead.
 */
export interface IP_InitRoleData_C extends P_InitRoleData_C.$Properties {
}

/** Represents a P_InitRoleData_C. */
export class P_InitRoleData_C {

    /**
     * Constructs a new P_InitRoleData_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_InitRoleData_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_InitRoleData_C req_type. */
    req_type?: (number|null);

    /** P_InitRoleData_C uid. */
    uid?: (number|null);

    /** P_InitRoleData_C user_name. */
    user_name?: (string|null);

    /** P_InitRoleData_C netid. */
    netid?: (number|null);

    /**
     * Creates a new P_InitRoleData_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_InitRoleData_C instance
     */
    static create(properties: P_InitRoleData_C.$Shape): P_InitRoleData_C & P_InitRoleData_C.$Shape;
    static create(properties?: P_InitRoleData_C.$Properties): P_InitRoleData_C;

    /**
     * Encodes the specified P_InitRoleData_C message. Does not implicitly {@link P_InitRoleData_C.verify|verify} messages.
     * @param message P_InitRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_InitRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_InitRoleData_C message, length delimited. Does not implicitly {@link P_InitRoleData_C.verify|verify} messages.
     * @param message P_InitRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_InitRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_InitRoleData_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_InitRoleData_C & P_InitRoleData_C.$Shape} P_InitRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_InitRoleData_C & P_InitRoleData_C.$Shape;

    /**
     * Decodes a P_InitRoleData_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_InitRoleData_C & P_InitRoleData_C.$Shape} P_InitRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_InitRoleData_C & P_InitRoleData_C.$Shape;

    /**
     * Verifies a P_InitRoleData_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_InitRoleData_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_InitRoleData_C
     */
    static fromObject(object: { [k: string]: any }): P_InitRoleData_C;

    /**
     * Creates a plain object from a P_InitRoleData_C message. Also converts values to other types if specified.
     * @param message P_InitRoleData_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_InitRoleData_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_InitRoleData_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_InitRoleData_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_InitRoleData_C {

    /** Properties of a P_InitRoleData_C. */
    interface $Properties {

        /** P_InitRoleData_C req_type */
        req_type?: (number|null);

        /** P_InitRoleData_C uid */
        uid?: (number|null);

        /** P_InitRoleData_C user_name */
        user_name?: (string|null);

        /** P_InitRoleData_C netid */
        netid?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_InitRoleData_C. */
    type $Shape = P_InitRoleData_C.$Properties;
}

/**
 * Properties of a P_InitRoleData_S.
 * @deprecated Use P_InitRoleData_S.$Properties instead.
 */
export interface IP_InitRoleData_S extends P_InitRoleData_S.$Properties {
}

/** Represents a P_InitRoleData_S. */
export class P_InitRoleData_S {

    /**
     * Constructs a new P_InitRoleData_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_InitRoleData_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_InitRoleData_S req_type. */
    req_type?: (number|null);

    /** P_InitRoleData_S role_data. */
    role_data?: (PB_RoleData.$Properties|null);

    /** P_InitRoleData_S user_name. */
    user_name?: (string|null);

    /** P_InitRoleData_S netid. */
    netid?: (number|null);

    /** P_InitRoleData_S ret. */
    ret?: (number|null);

    /**
     * Creates a new P_InitRoleData_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_InitRoleData_S instance
     */
    static create(properties: P_InitRoleData_S.$Shape): P_InitRoleData_S & P_InitRoleData_S.$Shape;
    static create(properties?: P_InitRoleData_S.$Properties): P_InitRoleData_S;

    /**
     * Encodes the specified P_InitRoleData_S message. Does not implicitly {@link P_InitRoleData_S.verify|verify} messages.
     * @param message P_InitRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_InitRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_InitRoleData_S message, length delimited. Does not implicitly {@link P_InitRoleData_S.verify|verify} messages.
     * @param message P_InitRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_InitRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_InitRoleData_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_InitRoleData_S & P_InitRoleData_S.$Shape} P_InitRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_InitRoleData_S & P_InitRoleData_S.$Shape;

    /**
     * Decodes a P_InitRoleData_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_InitRoleData_S & P_InitRoleData_S.$Shape} P_InitRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_InitRoleData_S & P_InitRoleData_S.$Shape;

    /**
     * Verifies a P_InitRoleData_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_InitRoleData_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_InitRoleData_S
     */
    static fromObject(object: { [k: string]: any }): P_InitRoleData_S;

    /**
     * Creates a plain object from a P_InitRoleData_S message. Also converts values to other types if specified.
     * @param message P_InitRoleData_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_InitRoleData_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_InitRoleData_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_InitRoleData_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_InitRoleData_S {

    /** Properties of a P_InitRoleData_S. */
    interface $Properties {

        /** P_InitRoleData_S req_type */
        req_type?: (number|null);

        /** P_InitRoleData_S role_data */
        role_data?: (PB_RoleData.$Properties|null);

        /** P_InitRoleData_S user_name */
        user_name?: (string|null);

        /** P_InitRoleData_S netid */
        netid?: (number|null);

        /** P_InitRoleData_S ret */
        ret?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_InitRoleData_S. */
    type $Shape = P_InitRoleData_S.$Properties;
}

/**
 * Properties of a P_SaveMultipleRoleData_C.
 * @deprecated Use P_SaveMultipleRoleData_C.$Properties instead.
 */
export interface IP_SaveMultipleRoleData_C extends P_SaveMultipleRoleData_C.$Properties {
}

/** Represents a P_SaveMultipleRoleData_C. */
export class P_SaveMultipleRoleData_C {

    /**
     * Constructs a new P_SaveMultipleRoleData_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SaveMultipleRoleData_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SaveMultipleRoleData_C req_type. */
    req_type?: (number|null);

    /** P_SaveMultipleRoleData_C datas. */
    datas: P_SaveRoleData_C.$Properties[];

    /**
     * Creates a new P_SaveMultipleRoleData_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SaveMultipleRoleData_C instance
     */
    static create(properties: P_SaveMultipleRoleData_C.$Shape): P_SaveMultipleRoleData_C & P_SaveMultipleRoleData_C.$Shape;
    static create(properties?: P_SaveMultipleRoleData_C.$Properties): P_SaveMultipleRoleData_C;

    /**
     * Encodes the specified P_SaveMultipleRoleData_C message. Does not implicitly {@link P_SaveMultipleRoleData_C.verify|verify} messages.
     * @param message P_SaveMultipleRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SaveMultipleRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SaveMultipleRoleData_C message, length delimited. Does not implicitly {@link P_SaveMultipleRoleData_C.verify|verify} messages.
     * @param message P_SaveMultipleRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SaveMultipleRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SaveMultipleRoleData_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SaveMultipleRoleData_C & P_SaveMultipleRoleData_C.$Shape} P_SaveMultipleRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SaveMultipleRoleData_C & P_SaveMultipleRoleData_C.$Shape;

    /**
     * Decodes a P_SaveMultipleRoleData_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SaveMultipleRoleData_C & P_SaveMultipleRoleData_C.$Shape} P_SaveMultipleRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SaveMultipleRoleData_C & P_SaveMultipleRoleData_C.$Shape;

    /**
     * Verifies a P_SaveMultipleRoleData_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SaveMultipleRoleData_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SaveMultipleRoleData_C
     */
    static fromObject(object: { [k: string]: any }): P_SaveMultipleRoleData_C;

    /**
     * Creates a plain object from a P_SaveMultipleRoleData_C message. Also converts values to other types if specified.
     * @param message P_SaveMultipleRoleData_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SaveMultipleRoleData_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SaveMultipleRoleData_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SaveMultipleRoleData_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SaveMultipleRoleData_C {

    /** Properties of a P_SaveMultipleRoleData_C. */
    interface $Properties {

        /** P_SaveMultipleRoleData_C req_type */
        req_type?: (number|null);

        /** P_SaveMultipleRoleData_C datas */
        datas?: (P_SaveRoleData_C.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SaveMultipleRoleData_C. */
    type $Shape = P_SaveMultipleRoleData_C.$Properties;
}

/**
 * Properties of a P_SaveMultipleRoleData_S.
 * @deprecated Use P_SaveMultipleRoleData_S.$Properties instead.
 */
export interface IP_SaveMultipleRoleData_S extends P_SaveMultipleRoleData_S.$Properties {
}

/** Represents a P_SaveMultipleRoleData_S. */
export class P_SaveMultipleRoleData_S {

    /**
     * Constructs a new P_SaveMultipleRoleData_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SaveMultipleRoleData_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SaveMultipleRoleData_S req_type. */
    req_type?: (number|null);

    /** P_SaveMultipleRoleData_S datas. */
    datas: P_SaveRoleData_S.$Properties[];

    /**
     * Creates a new P_SaveMultipleRoleData_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SaveMultipleRoleData_S instance
     */
    static create(properties: P_SaveMultipleRoleData_S.$Shape): P_SaveMultipleRoleData_S & P_SaveMultipleRoleData_S.$Shape;
    static create(properties?: P_SaveMultipleRoleData_S.$Properties): P_SaveMultipleRoleData_S;

    /**
     * Encodes the specified P_SaveMultipleRoleData_S message. Does not implicitly {@link P_SaveMultipleRoleData_S.verify|verify} messages.
     * @param message P_SaveMultipleRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SaveMultipleRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SaveMultipleRoleData_S message, length delimited. Does not implicitly {@link P_SaveMultipleRoleData_S.verify|verify} messages.
     * @param message P_SaveMultipleRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SaveMultipleRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SaveMultipleRoleData_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SaveMultipleRoleData_S & P_SaveMultipleRoleData_S.$Shape} P_SaveMultipleRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SaveMultipleRoleData_S & P_SaveMultipleRoleData_S.$Shape;

    /**
     * Decodes a P_SaveMultipleRoleData_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SaveMultipleRoleData_S & P_SaveMultipleRoleData_S.$Shape} P_SaveMultipleRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SaveMultipleRoleData_S & P_SaveMultipleRoleData_S.$Shape;

    /**
     * Verifies a P_SaveMultipleRoleData_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SaveMultipleRoleData_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SaveMultipleRoleData_S
     */
    static fromObject(object: { [k: string]: any }): P_SaveMultipleRoleData_S;

    /**
     * Creates a plain object from a P_SaveMultipleRoleData_S message. Also converts values to other types if specified.
     * @param message P_SaveMultipleRoleData_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SaveMultipleRoleData_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SaveMultipleRoleData_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SaveMultipleRoleData_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SaveMultipleRoleData_S {

    /** Properties of a P_SaveMultipleRoleData_S. */
    interface $Properties {

        /** P_SaveMultipleRoleData_S req_type */
        req_type?: (number|null);

        /** P_SaveMultipleRoleData_S datas */
        datas?: (P_SaveRoleData_S.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SaveMultipleRoleData_S. */
    type $Shape = P_SaveMultipleRoleData_S.$Properties;
}

/**
 * Properties of a P_InitMultipleRoleData_C.
 * @deprecated Use P_InitMultipleRoleData_C.$Properties instead.
 */
export interface IP_InitMultipleRoleData_C extends P_InitMultipleRoleData_C.$Properties {
}

/** Represents a P_InitMultipleRoleData_C. */
export class P_InitMultipleRoleData_C {

    /**
     * Constructs a new P_InitMultipleRoleData_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_InitMultipleRoleData_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_InitMultipleRoleData_C req_type. */
    req_type?: (number|null);

    /** P_InitMultipleRoleData_C datas. */
    datas: P_InitRoleData_C.$Properties[];

    /**
     * Creates a new P_InitMultipleRoleData_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_InitMultipleRoleData_C instance
     */
    static create(properties: P_InitMultipleRoleData_C.$Shape): P_InitMultipleRoleData_C & P_InitMultipleRoleData_C.$Shape;
    static create(properties?: P_InitMultipleRoleData_C.$Properties): P_InitMultipleRoleData_C;

    /**
     * Encodes the specified P_InitMultipleRoleData_C message. Does not implicitly {@link P_InitMultipleRoleData_C.verify|verify} messages.
     * @param message P_InitMultipleRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_InitMultipleRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_InitMultipleRoleData_C message, length delimited. Does not implicitly {@link P_InitMultipleRoleData_C.verify|verify} messages.
     * @param message P_InitMultipleRoleData_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_InitMultipleRoleData_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_InitMultipleRoleData_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_InitMultipleRoleData_C & P_InitMultipleRoleData_C.$Shape} P_InitMultipleRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_InitMultipleRoleData_C & P_InitMultipleRoleData_C.$Shape;

    /**
     * Decodes a P_InitMultipleRoleData_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_InitMultipleRoleData_C & P_InitMultipleRoleData_C.$Shape} P_InitMultipleRoleData_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_InitMultipleRoleData_C & P_InitMultipleRoleData_C.$Shape;

    /**
     * Verifies a P_InitMultipleRoleData_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_InitMultipleRoleData_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_InitMultipleRoleData_C
     */
    static fromObject(object: { [k: string]: any }): P_InitMultipleRoleData_C;

    /**
     * Creates a plain object from a P_InitMultipleRoleData_C message. Also converts values to other types if specified.
     * @param message P_InitMultipleRoleData_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_InitMultipleRoleData_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_InitMultipleRoleData_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_InitMultipleRoleData_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_InitMultipleRoleData_C {

    /** Properties of a P_InitMultipleRoleData_C. */
    interface $Properties {

        /** P_InitMultipleRoleData_C req_type */
        req_type?: (number|null);

        /** P_InitMultipleRoleData_C datas */
        datas?: (P_InitRoleData_C.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_InitMultipleRoleData_C. */
    type $Shape = P_InitMultipleRoleData_C.$Properties;
}

/**
 * Properties of a P_InitMultipleRoleData_S.
 * @deprecated Use P_InitMultipleRoleData_S.$Properties instead.
 */
export interface IP_InitMultipleRoleData_S extends P_InitMultipleRoleData_S.$Properties {
}

/** Represents a P_InitMultipleRoleData_S. */
export class P_InitMultipleRoleData_S {

    /**
     * Constructs a new P_InitMultipleRoleData_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_InitMultipleRoleData_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_InitMultipleRoleData_S req_type. */
    req_type?: (number|null);

    /** P_InitMultipleRoleData_S datas. */
    datas: P_InitRoleData_S.$Properties[];

    /**
     * Creates a new P_InitMultipleRoleData_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_InitMultipleRoleData_S instance
     */
    static create(properties: P_InitMultipleRoleData_S.$Shape): P_InitMultipleRoleData_S & P_InitMultipleRoleData_S.$Shape;
    static create(properties?: P_InitMultipleRoleData_S.$Properties): P_InitMultipleRoleData_S;

    /**
     * Encodes the specified P_InitMultipleRoleData_S message. Does not implicitly {@link P_InitMultipleRoleData_S.verify|verify} messages.
     * @param message P_InitMultipleRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_InitMultipleRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_InitMultipleRoleData_S message, length delimited. Does not implicitly {@link P_InitMultipleRoleData_S.verify|verify} messages.
     * @param message P_InitMultipleRoleData_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_InitMultipleRoleData_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_InitMultipleRoleData_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_InitMultipleRoleData_S & P_InitMultipleRoleData_S.$Shape} P_InitMultipleRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_InitMultipleRoleData_S & P_InitMultipleRoleData_S.$Shape;

    /**
     * Decodes a P_InitMultipleRoleData_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_InitMultipleRoleData_S & P_InitMultipleRoleData_S.$Shape} P_InitMultipleRoleData_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_InitMultipleRoleData_S & P_InitMultipleRoleData_S.$Shape;

    /**
     * Verifies a P_InitMultipleRoleData_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_InitMultipleRoleData_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_InitMultipleRoleData_S
     */
    static fromObject(object: { [k: string]: any }): P_InitMultipleRoleData_S;

    /**
     * Creates a plain object from a P_InitMultipleRoleData_S message. Also converts values to other types if specified.
     * @param message P_InitMultipleRoleData_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_InitMultipleRoleData_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_InitMultipleRoleData_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_InitMultipleRoleData_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_InitMultipleRoleData_S {

    /** Properties of a P_InitMultipleRoleData_S. */
    interface $Properties {

        /** P_InitMultipleRoleData_S req_type */
        req_type?: (number|null);

        /** P_InitMultipleRoleData_S datas */
        datas?: (P_InitRoleData_S.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_InitMultipleRoleData_S. */
    type $Shape = P_InitMultipleRoleData_S.$Properties;
}

/**
 * Properties of a PB_InnerChatMap.
 * @deprecated Use PB_InnerChatMap.$Properties instead.
 */
export interface IPB_InnerChatMap extends PB_InnerChatMap.$Properties {
}

/** Represents a PB_InnerChatMap. */
export class PB_InnerChatMap {

    /**
     * Constructs a new PB_InnerChatMap.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_InnerChatMap.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_InnerChatMap chats. */
    chats: { [k: string]: PB_ChatData.$Properties };

    /**
     * Creates a new PB_InnerChatMap instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_InnerChatMap instance
     */
    static create(properties: PB_InnerChatMap.$Shape): PB_InnerChatMap & PB_InnerChatMap.$Shape;
    static create(properties?: PB_InnerChatMap.$Properties): PB_InnerChatMap;

    /**
     * Encodes the specified PB_InnerChatMap message. Does not implicitly {@link PB_InnerChatMap.verify|verify} messages.
     * @param message PB_InnerChatMap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_InnerChatMap.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_InnerChatMap message, length delimited. Does not implicitly {@link PB_InnerChatMap.verify|verify} messages.
     * @param message PB_InnerChatMap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_InnerChatMap.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_InnerChatMap message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_InnerChatMap & PB_InnerChatMap.$Shape} PB_InnerChatMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_InnerChatMap & PB_InnerChatMap.$Shape;

    /**
     * Decodes a PB_InnerChatMap message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_InnerChatMap & PB_InnerChatMap.$Shape} PB_InnerChatMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_InnerChatMap & PB_InnerChatMap.$Shape;

    /**
     * Verifies a PB_InnerChatMap message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_InnerChatMap message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_InnerChatMap
     */
    static fromObject(object: { [k: string]: any }): PB_InnerChatMap;

    /**
     * Creates a plain object from a PB_InnerChatMap message. Also converts values to other types if specified.
     * @param message PB_InnerChatMap
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_InnerChatMap, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_InnerChatMap to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_InnerChatMap
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_InnerChatMap {

    /** Properties of a PB_InnerChatMap. */
    interface $Properties {

        /** PB_InnerChatMap chats */
        chats?: ({ [k: string]: PB_ChatData.$Properties }|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_InnerChatMap. */
    type $Shape = PB_InnerChatMap.$Properties;
}

/**
 * Properties of a P_ChatDb_C.
 * @deprecated Use P_ChatDb_C.$Properties instead.
 */
export interface IP_ChatDb_C extends P_ChatDb_C.$Properties {
}

/** Represents a P_ChatDb_C. */
export class P_ChatDb_C {

    /**
     * Constructs a new P_ChatDb_C.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ChatDb_C.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ChatDb_C req_type. */
    req_type?: (number|null);

    /** P_ChatDb_C types. */
    types: { [k: string]: PB_InnerChatMap.$Properties };

    /**
     * Creates a new P_ChatDb_C instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ChatDb_C instance
     */
    static create(properties: P_ChatDb_C.$Shape): P_ChatDb_C & P_ChatDb_C.$Shape;
    static create(properties?: P_ChatDb_C.$Properties): P_ChatDb_C;

    /**
     * Encodes the specified P_ChatDb_C message. Does not implicitly {@link P_ChatDb_C.verify|verify} messages.
     * @param message P_ChatDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ChatDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ChatDb_C message, length delimited. Does not implicitly {@link P_ChatDb_C.verify|verify} messages.
     * @param message P_ChatDb_C message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ChatDb_C.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ChatDb_C message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ChatDb_C & P_ChatDb_C.$Shape} P_ChatDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ChatDb_C & P_ChatDb_C.$Shape;

    /**
     * Decodes a P_ChatDb_C message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ChatDb_C & P_ChatDb_C.$Shape} P_ChatDb_C
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ChatDb_C & P_ChatDb_C.$Shape;

    /**
     * Verifies a P_ChatDb_C message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ChatDb_C message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ChatDb_C
     */
    static fromObject(object: { [k: string]: any }): P_ChatDb_C;

    /**
     * Creates a plain object from a P_ChatDb_C message. Also converts values to other types if specified.
     * @param message P_ChatDb_C
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ChatDb_C, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ChatDb_C to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ChatDb_C
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ChatDb_C {

    /** Properties of a P_ChatDb_C. */
    interface $Properties {

        /** P_ChatDb_C req_type */
        req_type?: (number|null);

        /** P_ChatDb_C types */
        types?: ({ [k: string]: PB_InnerChatMap.$Properties }|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ChatDb_C. */
    type $Shape = P_ChatDb_C.$Properties;
}

/**
 * Properties of a P_ChatDb_S.
 * @deprecated Use P_ChatDb_S.$Properties instead.
 */
export interface IP_ChatDb_S extends P_ChatDb_S.$Properties {
}

/** Represents a P_ChatDb_S. */
export class P_ChatDb_S {

    /**
     * Constructs a new P_ChatDb_S.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ChatDb_S.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ChatDb_S req_type. */
    req_type?: (number|null);

    /** P_ChatDb_S types. */
    types: { [k: string]: PB_InnerChatMap.$Properties };

    /** P_ChatDb_S save_ret. */
    save_ret?: (number|null);

    /**
     * Creates a new P_ChatDb_S instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ChatDb_S instance
     */
    static create(properties: P_ChatDb_S.$Shape): P_ChatDb_S & P_ChatDb_S.$Shape;
    static create(properties?: P_ChatDb_S.$Properties): P_ChatDb_S;

    /**
     * Encodes the specified P_ChatDb_S message. Does not implicitly {@link P_ChatDb_S.verify|verify} messages.
     * @param message P_ChatDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ChatDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ChatDb_S message, length delimited. Does not implicitly {@link P_ChatDb_S.verify|verify} messages.
     * @param message P_ChatDb_S message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ChatDb_S.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ChatDb_S message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ChatDb_S & P_ChatDb_S.$Shape} P_ChatDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ChatDb_S & P_ChatDb_S.$Shape;

    /**
     * Decodes a P_ChatDb_S message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ChatDb_S & P_ChatDb_S.$Shape} P_ChatDb_S
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ChatDb_S & P_ChatDb_S.$Shape;

    /**
     * Verifies a P_ChatDb_S message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ChatDb_S message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ChatDb_S
     */
    static fromObject(object: { [k: string]: any }): P_ChatDb_S;

    /**
     * Creates a plain object from a P_ChatDb_S message. Also converts values to other types if specified.
     * @param message P_ChatDb_S
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ChatDb_S, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ChatDb_S to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ChatDb_S
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ChatDb_S {

    /** Properties of a P_ChatDb_S. */
    interface $Properties {

        /** P_ChatDb_S req_type */
        req_type?: (number|null);

        /** P_ChatDb_S types */
        types?: ({ [k: string]: PB_InnerChatMap.$Properties }|null);

        /** P_ChatDb_S save_ret */
        save_ret?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ChatDb_S. */
    type $Shape = P_ChatDb_S.$Properties;
}

/**
 * Properties of a P_BattleServerRegister.
 * @deprecated Use P_BattleServerRegister.$Properties instead.
 */
export interface IP_BattleServerRegister extends P_BattleServerRegister.$Properties {
}

/** Represents a P_BattleServerRegister. */
export class P_BattleServerRegister {

    /**
     * Constructs a new P_BattleServerRegister.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerRegister.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerRegister ue_id. */
    ue_id?: (number|null);

    /** P_BattleServerRegister ip. */
    ip?: (string|null);

    /** P_BattleServerRegister port. */
    port?: (number|null);

    /** P_BattleServerRegister weight. */
    weight?: (number|null);

    /**
     * Creates a new P_BattleServerRegister instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerRegister instance
     */
    static create(properties: P_BattleServerRegister.$Shape): P_BattleServerRegister & P_BattleServerRegister.$Shape;
    static create(properties?: P_BattleServerRegister.$Properties): P_BattleServerRegister;

    /**
     * Encodes the specified P_BattleServerRegister message. Does not implicitly {@link P_BattleServerRegister.verify|verify} messages.
     * @param message P_BattleServerRegister message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerRegister.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerRegister message, length delimited. Does not implicitly {@link P_BattleServerRegister.verify|verify} messages.
     * @param message P_BattleServerRegister message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerRegister.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerRegister message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerRegister & P_BattleServerRegister.$Shape} P_BattleServerRegister
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerRegister & P_BattleServerRegister.$Shape;

    /**
     * Decodes a P_BattleServerRegister message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerRegister & P_BattleServerRegister.$Shape} P_BattleServerRegister
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerRegister & P_BattleServerRegister.$Shape;

    /**
     * Verifies a P_BattleServerRegister message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerRegister message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerRegister
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerRegister;

    /**
     * Creates a plain object from a P_BattleServerRegister message. Also converts values to other types if specified.
     * @param message P_BattleServerRegister
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerRegister, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerRegister to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerRegister
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerRegister {

    /** Properties of a P_BattleServerRegister. */
    interface $Properties {

        /** P_BattleServerRegister ue_id */
        ue_id?: (number|null);

        /** P_BattleServerRegister ip */
        ip?: (string|null);

        /** P_BattleServerRegister port */
        port?: (number|null);

        /** P_BattleServerRegister weight */
        weight?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerRegister. */
    type $Shape = P_BattleServerRegister.$Properties;
}

/**
 * Properties of a P_BattleServerHeartbeat.
 * @deprecated Use P_BattleServerHeartbeat.$Properties instead.
 */
export interface IP_BattleServerHeartbeat extends P_BattleServerHeartbeat.$Properties {
}

/** Represents a P_BattleServerHeartbeat. */
export class P_BattleServerHeartbeat {

    /**
     * Constructs a new P_BattleServerHeartbeat.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerHeartbeat.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerHeartbeat ue_id. */
    ue_id?: (number|null);

    /** P_BattleServerHeartbeat player_count. */
    player_count?: (number|null);

    /** P_BattleServerHeartbeat cpu_usage. */
    cpu_usage?: (number|null);

    /**
     * Creates a new P_BattleServerHeartbeat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerHeartbeat instance
     */
    static create(properties: P_BattleServerHeartbeat.$Shape): P_BattleServerHeartbeat & P_BattleServerHeartbeat.$Shape;
    static create(properties?: P_BattleServerHeartbeat.$Properties): P_BattleServerHeartbeat;

    /**
     * Encodes the specified P_BattleServerHeartbeat message. Does not implicitly {@link P_BattleServerHeartbeat.verify|verify} messages.
     * @param message P_BattleServerHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerHeartbeat message, length delimited. Does not implicitly {@link P_BattleServerHeartbeat.verify|verify} messages.
     * @param message P_BattleServerHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerHeartbeat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerHeartbeat & P_BattleServerHeartbeat.$Shape} P_BattleServerHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerHeartbeat & P_BattleServerHeartbeat.$Shape;

    /**
     * Decodes a P_BattleServerHeartbeat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerHeartbeat & P_BattleServerHeartbeat.$Shape} P_BattleServerHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerHeartbeat & P_BattleServerHeartbeat.$Shape;

    /**
     * Verifies a P_BattleServerHeartbeat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerHeartbeat message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerHeartbeat
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerHeartbeat;

    /**
     * Creates a plain object from a P_BattleServerHeartbeat message. Also converts values to other types if specified.
     * @param message P_BattleServerHeartbeat
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerHeartbeat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerHeartbeat to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerHeartbeat
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerHeartbeat {

    /** Properties of a P_BattleServerHeartbeat. */
    interface $Properties {

        /** P_BattleServerHeartbeat ue_id */
        ue_id?: (number|null);

        /** P_BattleServerHeartbeat player_count */
        player_count?: (number|null);

        /** P_BattleServerHeartbeat cpu_usage */
        cpu_usage?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerHeartbeat. */
    type $Shape = P_BattleServerHeartbeat.$Properties;
}

/**
 * Properties of a P_BattleServerCommand.
 * @deprecated Use P_BattleServerCommand.$Properties instead.
 */
export interface IP_BattleServerCommand extends P_BattleServerCommand.$Properties {
}

/** Represents a P_BattleServerCommand. */
export class P_BattleServerCommand {

    /**
     * Constructs a new P_BattleServerCommand.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerCommand.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerCommand ue_id. */
    ue_id?: (number|null);

    /** P_BattleServerCommand command. */
    command?: (string|null);

    /**
     * Creates a new P_BattleServerCommand instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerCommand instance
     */
    static create(properties: P_BattleServerCommand.$Shape): P_BattleServerCommand & P_BattleServerCommand.$Shape;
    static create(properties?: P_BattleServerCommand.$Properties): P_BattleServerCommand;

    /**
     * Encodes the specified P_BattleServerCommand message. Does not implicitly {@link P_BattleServerCommand.verify|verify} messages.
     * @param message P_BattleServerCommand message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerCommand.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerCommand message, length delimited. Does not implicitly {@link P_BattleServerCommand.verify|verify} messages.
     * @param message P_BattleServerCommand message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerCommand.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerCommand message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerCommand & P_BattleServerCommand.$Shape} P_BattleServerCommand
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerCommand & P_BattleServerCommand.$Shape;

    /**
     * Decodes a P_BattleServerCommand message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerCommand & P_BattleServerCommand.$Shape} P_BattleServerCommand
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerCommand & P_BattleServerCommand.$Shape;

    /**
     * Verifies a P_BattleServerCommand message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerCommand message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerCommand
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerCommand;

    /**
     * Creates a plain object from a P_BattleServerCommand message. Also converts values to other types if specified.
     * @param message P_BattleServerCommand
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerCommand, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerCommand to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerCommand
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerCommand {

    /** Properties of a P_BattleServerCommand. */
    interface $Properties {

        /** P_BattleServerCommand ue_id */
        ue_id?: (number|null);

        /** P_BattleServerCommand command */
        command?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerCommand. */
    type $Shape = P_BattleServerCommand.$Properties;
}

/**
 * Properties of a P_BattleServerStatus.
 * @deprecated Use P_BattleServerStatus.$Properties instead.
 */
export interface IP_BattleServerStatus extends P_BattleServerStatus.$Properties {
}

/** Represents a P_BattleServerStatus. */
export class P_BattleServerStatus {

    /**
     * Constructs a new P_BattleServerStatus.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerStatus.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerStatus ue_id. */
    ue_id?: (number|null);

    /** P_BattleServerStatus alive. */
    alive?: (boolean|null);

    /** P_BattleServerStatus player_count. */
    player_count?: (number|null);

    /** P_BattleServerStatus cpu_usage. */
    cpu_usage?: (number|null);

    /**
     * Creates a new P_BattleServerStatus instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerStatus instance
     */
    static create(properties: P_BattleServerStatus.$Shape): P_BattleServerStatus & P_BattleServerStatus.$Shape;
    static create(properties?: P_BattleServerStatus.$Properties): P_BattleServerStatus;

    /**
     * Encodes the specified P_BattleServerStatus message. Does not implicitly {@link P_BattleServerStatus.verify|verify} messages.
     * @param message P_BattleServerStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerStatus.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerStatus message, length delimited. Does not implicitly {@link P_BattleServerStatus.verify|verify} messages.
     * @param message P_BattleServerStatus message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerStatus.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerStatus message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerStatus & P_BattleServerStatus.$Shape} P_BattleServerStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerStatus & P_BattleServerStatus.$Shape;

    /**
     * Decodes a P_BattleServerStatus message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerStatus & P_BattleServerStatus.$Shape} P_BattleServerStatus
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerStatus & P_BattleServerStatus.$Shape;

    /**
     * Verifies a P_BattleServerStatus message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerStatus message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerStatus
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerStatus;

    /**
     * Creates a plain object from a P_BattleServerStatus message. Also converts values to other types if specified.
     * @param message P_BattleServerStatus
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerStatus to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerStatus
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerStatus {

    /** Properties of a P_BattleServerStatus. */
    interface $Properties {

        /** P_BattleServerStatus ue_id */
        ue_id?: (number|null);

        /** P_BattleServerStatus alive */
        alive?: (boolean|null);

        /** P_BattleServerStatus player_count */
        player_count?: (number|null);

        /** P_BattleServerStatus cpu_usage */
        cpu_usage?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerStatus. */
    type $Shape = P_BattleServerStatus.$Properties;
}

/**
 * Properties of a P_BattleServerRegisterTokenAndRoleData.
 * @deprecated Use P_BattleServerRegisterTokenAndRoleData.$Properties instead.
 */
export interface IP_BattleServerRegisterTokenAndRoleData extends P_BattleServerRegisterTokenAndRoleData.$Properties {
}

/** Represents a P_BattleServerRegisterTokenAndRoleData. */
export class P_BattleServerRegisterTokenAndRoleData {

    /**
     * Constructs a new P_BattleServerRegisterTokenAndRoleData.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerRegisterTokenAndRoleData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerRegisterTokenAndRoleData ue_id. */
    ue_id?: (number|null);

    /** P_BattleServerRegisterTokenAndRoleData role_data. */
    role_data?: (PB_RoleData.$Properties|null);

    /** P_BattleServerRegisterTokenAndRoleData token. */
    token?: (string|null);

    /**
     * Creates a new P_BattleServerRegisterTokenAndRoleData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerRegisterTokenAndRoleData instance
     */
    static create(properties: P_BattleServerRegisterTokenAndRoleData.$Shape): P_BattleServerRegisterTokenAndRoleData & P_BattleServerRegisterTokenAndRoleData.$Shape;
    static create(properties?: P_BattleServerRegisterTokenAndRoleData.$Properties): P_BattleServerRegisterTokenAndRoleData;

    /**
     * Encodes the specified P_BattleServerRegisterTokenAndRoleData message. Does not implicitly {@link P_BattleServerRegisterTokenAndRoleData.verify|verify} messages.
     * @param message P_BattleServerRegisterTokenAndRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerRegisterTokenAndRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerRegisterTokenAndRoleData message, length delimited. Does not implicitly {@link P_BattleServerRegisterTokenAndRoleData.verify|verify} messages.
     * @param message P_BattleServerRegisterTokenAndRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerRegisterTokenAndRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerRegisterTokenAndRoleData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerRegisterTokenAndRoleData & P_BattleServerRegisterTokenAndRoleData.$Shape} P_BattleServerRegisterTokenAndRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerRegisterTokenAndRoleData & P_BattleServerRegisterTokenAndRoleData.$Shape;

    /**
     * Decodes a P_BattleServerRegisterTokenAndRoleData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerRegisterTokenAndRoleData & P_BattleServerRegisterTokenAndRoleData.$Shape} P_BattleServerRegisterTokenAndRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerRegisterTokenAndRoleData & P_BattleServerRegisterTokenAndRoleData.$Shape;

    /**
     * Verifies a P_BattleServerRegisterTokenAndRoleData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerRegisterTokenAndRoleData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerRegisterTokenAndRoleData
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerRegisterTokenAndRoleData;

    /**
     * Creates a plain object from a P_BattleServerRegisterTokenAndRoleData message. Also converts values to other types if specified.
     * @param message P_BattleServerRegisterTokenAndRoleData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerRegisterTokenAndRoleData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerRegisterTokenAndRoleData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerRegisterTokenAndRoleData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerRegisterTokenAndRoleData {

    /** Properties of a P_BattleServerRegisterTokenAndRoleData. */
    interface $Properties {

        /** P_BattleServerRegisterTokenAndRoleData ue_id */
        ue_id?: (number|null);

        /** P_BattleServerRegisterTokenAndRoleData role_data */
        role_data?: (PB_RoleData.$Properties|null);

        /** P_BattleServerRegisterTokenAndRoleData token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerRegisterTokenAndRoleData. */
    type $Shape = P_BattleServerRegisterTokenAndRoleData.$Properties;
}

/**
 * Properties of a P_BattleServerSaveRoleData.
 * @deprecated Use P_BattleServerSaveRoleData.$Properties instead.
 */
export interface IP_BattleServerSaveRoleData extends P_BattleServerSaveRoleData.$Properties {
}

/** Represents a P_BattleServerSaveRoleData. */
export class P_BattleServerSaveRoleData {

    /**
     * Constructs a new P_BattleServerSaveRoleData.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerSaveRoleData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerSaveRoleData role_data. */
    role_data?: (PB_RoleData.$Properties|null);

    /** P_BattleServerSaveRoleData token. */
    token?: (string|null);

    /**
     * Creates a new P_BattleServerSaveRoleData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerSaveRoleData instance
     */
    static create(properties: P_BattleServerSaveRoleData.$Shape): P_BattleServerSaveRoleData & P_BattleServerSaveRoleData.$Shape;
    static create(properties?: P_BattleServerSaveRoleData.$Properties): P_BattleServerSaveRoleData;

    /**
     * Encodes the specified P_BattleServerSaveRoleData message. Does not implicitly {@link P_BattleServerSaveRoleData.verify|verify} messages.
     * @param message P_BattleServerSaveRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerSaveRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerSaveRoleData message, length delimited. Does not implicitly {@link P_BattleServerSaveRoleData.verify|verify} messages.
     * @param message P_BattleServerSaveRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerSaveRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerSaveRoleData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerSaveRoleData & P_BattleServerSaveRoleData.$Shape} P_BattleServerSaveRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerSaveRoleData & P_BattleServerSaveRoleData.$Shape;

    /**
     * Decodes a P_BattleServerSaveRoleData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerSaveRoleData & P_BattleServerSaveRoleData.$Shape} P_BattleServerSaveRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerSaveRoleData & P_BattleServerSaveRoleData.$Shape;

    /**
     * Verifies a P_BattleServerSaveRoleData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerSaveRoleData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerSaveRoleData
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerSaveRoleData;

    /**
     * Creates a plain object from a P_BattleServerSaveRoleData message. Also converts values to other types if specified.
     * @param message P_BattleServerSaveRoleData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerSaveRoleData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerSaveRoleData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerSaveRoleData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerSaveRoleData {

    /** Properties of a P_BattleServerSaveRoleData. */
    interface $Properties {

        /** P_BattleServerSaveRoleData role_data */
        role_data?: (PB_RoleData.$Properties|null);

        /** P_BattleServerSaveRoleData token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerSaveRoleData. */
    type $Shape = P_BattleServerSaveRoleData.$Properties;
}

/**
 * Properties of a P_BattleServerKickOutRole.
 * @deprecated Use P_BattleServerKickOutRole.$Properties instead.
 */
export interface IP_BattleServerKickOutRole extends P_BattleServerKickOutRole.$Properties {
}

/** Represents a P_BattleServerKickOutRole. */
export class P_BattleServerKickOutRole {

    /**
     * Constructs a new P_BattleServerKickOutRole.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServerKickOutRole.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServerKickOutRole uid. */
    uid?: (number|null);

    /** P_BattleServerKickOutRole token. */
    token?: (string|null);

    /**
     * Creates a new P_BattleServerKickOutRole instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServerKickOutRole instance
     */
    static create(properties: P_BattleServerKickOutRole.$Shape): P_BattleServerKickOutRole & P_BattleServerKickOutRole.$Shape;
    static create(properties?: P_BattleServerKickOutRole.$Properties): P_BattleServerKickOutRole;

    /**
     * Encodes the specified P_BattleServerKickOutRole message. Does not implicitly {@link P_BattleServerKickOutRole.verify|verify} messages.
     * @param message P_BattleServerKickOutRole message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServerKickOutRole.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServerKickOutRole message, length delimited. Does not implicitly {@link P_BattleServerKickOutRole.verify|verify} messages.
     * @param message P_BattleServerKickOutRole message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServerKickOutRole.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServerKickOutRole message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServerKickOutRole & P_BattleServerKickOutRole.$Shape} P_BattleServerKickOutRole
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServerKickOutRole & P_BattleServerKickOutRole.$Shape;

    /**
     * Decodes a P_BattleServerKickOutRole message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServerKickOutRole & P_BattleServerKickOutRole.$Shape} P_BattleServerKickOutRole
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServerKickOutRole & P_BattleServerKickOutRole.$Shape;

    /**
     * Verifies a P_BattleServerKickOutRole message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServerKickOutRole message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServerKickOutRole
     */
    static fromObject(object: { [k: string]: any }): P_BattleServerKickOutRole;

    /**
     * Creates a plain object from a P_BattleServerKickOutRole message. Also converts values to other types if specified.
     * @param message P_BattleServerKickOutRole
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServerKickOutRole, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServerKickOutRole to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServerKickOutRole
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServerKickOutRole {

    /** Properties of a P_BattleServerKickOutRole. */
    interface $Properties {

        /** P_BattleServerKickOutRole uid */
        uid?: (number|null);

        /** P_BattleServerKickOutRole token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServerKickOutRole. */
    type $Shape = P_BattleServerKickOutRole.$Properties;
}

/**
 * Properties of a P_MmoEnterScene_CS.
 * @deprecated Use P_MmoEnterScene_CS.$Properties instead.
 */
export interface IP_MmoEnterScene_CS extends P_MmoEnterScene_CS.$Properties {
}

/** Represents a P_MmoEnterScene_CS. */
export class P_MmoEnterScene_CS {

    /**
     * Constructs a new P_MmoEnterScene_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoEnterScene_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoEnterScene_CS scene_id. */
    scene_id?: (number|null);

    /** P_MmoEnterScene_CS x. */
    x?: (number|null);

    /** P_MmoEnterScene_CS y. */
    y?: (number|null);

    /** P_MmoEnterScene_CS z. */
    z?: (number|null);

    /**
     * Creates a new P_MmoEnterScene_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoEnterScene_CS instance
     */
    static create(properties: P_MmoEnterScene_CS.$Shape): P_MmoEnterScene_CS & P_MmoEnterScene_CS.$Shape;
    static create(properties?: P_MmoEnterScene_CS.$Properties): P_MmoEnterScene_CS;

    /**
     * Encodes the specified P_MmoEnterScene_CS message. Does not implicitly {@link P_MmoEnterScene_CS.verify|verify} messages.
     * @param message P_MmoEnterScene_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoEnterScene_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoEnterScene_CS message, length delimited. Does not implicitly {@link P_MmoEnterScene_CS.verify|verify} messages.
     * @param message P_MmoEnterScene_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoEnterScene_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoEnterScene_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoEnterScene_CS & P_MmoEnterScene_CS.$Shape} P_MmoEnterScene_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoEnterScene_CS & P_MmoEnterScene_CS.$Shape;

    /**
     * Decodes a P_MmoEnterScene_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoEnterScene_CS & P_MmoEnterScene_CS.$Shape} P_MmoEnterScene_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoEnterScene_CS & P_MmoEnterScene_CS.$Shape;

    /**
     * Verifies a P_MmoEnterScene_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoEnterScene_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoEnterScene_CS
     */
    static fromObject(object: { [k: string]: any }): P_MmoEnterScene_CS;

    /**
     * Creates a plain object from a P_MmoEnterScene_CS message. Also converts values to other types if specified.
     * @param message P_MmoEnterScene_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoEnterScene_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoEnterScene_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoEnterScene_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoEnterScene_CS {

    /** Properties of a P_MmoEnterScene_CS. */
    interface $Properties {

        /** P_MmoEnterScene_CS scene_id */
        scene_id?: (number|null);

        /** P_MmoEnterScene_CS x */
        x?: (number|null);

        /** P_MmoEnterScene_CS y */
        y?: (number|null);

        /** P_MmoEnterScene_CS z */
        z?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoEnterScene_CS. */
    type $Shape = P_MmoEnterScene_CS.$Properties;
}

/**
 * Properties of a P_MmoLeaveScene_CS.
 * @deprecated Use P_MmoLeaveScene_CS.$Properties instead.
 */
export interface IP_MmoLeaveScene_CS extends P_MmoLeaveScene_CS.$Properties {
}

/** Represents a P_MmoLeaveScene_CS. */
export class P_MmoLeaveScene_CS {

    /**
     * Constructs a new P_MmoLeaveScene_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoLeaveScene_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoLeaveScene_CS scene_id. */
    scene_id?: (number|null);

    /**
     * Creates a new P_MmoLeaveScene_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoLeaveScene_CS instance
     */
    static create(properties: P_MmoLeaveScene_CS.$Shape): P_MmoLeaveScene_CS & P_MmoLeaveScene_CS.$Shape;
    static create(properties?: P_MmoLeaveScene_CS.$Properties): P_MmoLeaveScene_CS;

    /**
     * Encodes the specified P_MmoLeaveScene_CS message. Does not implicitly {@link P_MmoLeaveScene_CS.verify|verify} messages.
     * @param message P_MmoLeaveScene_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoLeaveScene_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoLeaveScene_CS message, length delimited. Does not implicitly {@link P_MmoLeaveScene_CS.verify|verify} messages.
     * @param message P_MmoLeaveScene_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoLeaveScene_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoLeaveScene_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoLeaveScene_CS & P_MmoLeaveScene_CS.$Shape} P_MmoLeaveScene_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoLeaveScene_CS & P_MmoLeaveScene_CS.$Shape;

    /**
     * Decodes a P_MmoLeaveScene_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoLeaveScene_CS & P_MmoLeaveScene_CS.$Shape} P_MmoLeaveScene_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoLeaveScene_CS & P_MmoLeaveScene_CS.$Shape;

    /**
     * Verifies a P_MmoLeaveScene_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoLeaveScene_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoLeaveScene_CS
     */
    static fromObject(object: { [k: string]: any }): P_MmoLeaveScene_CS;

    /**
     * Creates a plain object from a P_MmoLeaveScene_CS message. Also converts values to other types if specified.
     * @param message P_MmoLeaveScene_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoLeaveScene_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoLeaveScene_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoLeaveScene_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoLeaveScene_CS {

    /** Properties of a P_MmoLeaveScene_CS. */
    interface $Properties {

        /** P_MmoLeaveScene_CS scene_id */
        scene_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoLeaveScene_CS. */
    type $Shape = P_MmoLeaveScene_CS.$Properties;
}

/**
 * Properties of a P_MmoMove_CS.
 * @deprecated Use P_MmoMove_CS.$Properties instead.
 */
export interface IP_MmoMove_CS extends P_MmoMove_CS.$Properties {
}

/** Represents a P_MmoMove_CS. */
export class P_MmoMove_CS {

    /**
     * Constructs a new P_MmoMove_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoMove_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoMove_CS x. */
    x?: (number|null);

    /** P_MmoMove_CS y. */
    y?: (number|null);

    /** P_MmoMove_CS z. */
    z?: (number|null);

    /** P_MmoMove_CS speed. */
    speed?: (number|null);

    /**
     * Creates a new P_MmoMove_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoMove_CS instance
     */
    static create(properties: P_MmoMove_CS.$Shape): P_MmoMove_CS & P_MmoMove_CS.$Shape;
    static create(properties?: P_MmoMove_CS.$Properties): P_MmoMove_CS;

    /**
     * Encodes the specified P_MmoMove_CS message. Does not implicitly {@link P_MmoMove_CS.verify|verify} messages.
     * @param message P_MmoMove_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoMove_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoMove_CS message, length delimited. Does not implicitly {@link P_MmoMove_CS.verify|verify} messages.
     * @param message P_MmoMove_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoMove_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoMove_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoMove_CS & P_MmoMove_CS.$Shape} P_MmoMove_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoMove_CS & P_MmoMove_CS.$Shape;

    /**
     * Decodes a P_MmoMove_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoMove_CS & P_MmoMove_CS.$Shape} P_MmoMove_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoMove_CS & P_MmoMove_CS.$Shape;

    /**
     * Verifies a P_MmoMove_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoMove_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoMove_CS
     */
    static fromObject(object: { [k: string]: any }): P_MmoMove_CS;

    /**
     * Creates a plain object from a P_MmoMove_CS message. Also converts values to other types if specified.
     * @param message P_MmoMove_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoMove_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoMove_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoMove_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoMove_CS {

    /** Properties of a P_MmoMove_CS. */
    interface $Properties {

        /** P_MmoMove_CS x */
        x?: (number|null);

        /** P_MmoMove_CS y */
        y?: (number|null);

        /** P_MmoMove_CS z */
        z?: (number|null);

        /** P_MmoMove_CS speed */
        speed?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoMove_CS. */
    type $Shape = P_MmoMove_CS.$Properties;
}

/**
 * Properties of a P_MmoStopMove_CS.
 * @deprecated Use P_MmoStopMove_CS.$Properties instead.
 */
export interface IP_MmoStopMove_CS extends P_MmoStopMove_CS.$Properties {
}

/** Represents a P_MmoStopMove_CS. */
export class P_MmoStopMove_CS {

    /**
     * Constructs a new P_MmoStopMove_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoStopMove_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoStopMove_CS x. */
    x?: (number|null);

    /** P_MmoStopMove_CS y. */
    y?: (number|null);

    /** P_MmoStopMove_CS z. */
    z?: (number|null);

    /**
     * Creates a new P_MmoStopMove_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoStopMove_CS instance
     */
    static create(properties: P_MmoStopMove_CS.$Shape): P_MmoStopMove_CS & P_MmoStopMove_CS.$Shape;
    static create(properties?: P_MmoStopMove_CS.$Properties): P_MmoStopMove_CS;

    /**
     * Encodes the specified P_MmoStopMove_CS message. Does not implicitly {@link P_MmoStopMove_CS.verify|verify} messages.
     * @param message P_MmoStopMove_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoStopMove_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoStopMove_CS message, length delimited. Does not implicitly {@link P_MmoStopMove_CS.verify|verify} messages.
     * @param message P_MmoStopMove_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoStopMove_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoStopMove_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoStopMove_CS & P_MmoStopMove_CS.$Shape} P_MmoStopMove_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoStopMove_CS & P_MmoStopMove_CS.$Shape;

    /**
     * Decodes a P_MmoStopMove_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoStopMove_CS & P_MmoStopMove_CS.$Shape} P_MmoStopMove_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoStopMove_CS & P_MmoStopMove_CS.$Shape;

    /**
     * Verifies a P_MmoStopMove_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoStopMove_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoStopMove_CS
     */
    static fromObject(object: { [k: string]: any }): P_MmoStopMove_CS;

    /**
     * Creates a plain object from a P_MmoStopMove_CS message. Also converts values to other types if specified.
     * @param message P_MmoStopMove_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoStopMove_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoStopMove_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoStopMove_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoStopMove_CS {

    /** Properties of a P_MmoStopMove_CS. */
    interface $Properties {

        /** P_MmoStopMove_CS x */
        x?: (number|null);

        /** P_MmoStopMove_CS y */
        y?: (number|null);

        /** P_MmoStopMove_CS z */
        z?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoStopMove_CS. */
    type $Shape = P_MmoStopMove_CS.$Properties;
}

/**
 * Properties of a P_MmoSyncEntity_SC.
 * @deprecated Use P_MmoSyncEntity_SC.$Properties instead.
 */
export interface IP_MmoSyncEntity_SC extends P_MmoSyncEntity_SC.$Properties {
}

/** Represents a P_MmoSyncEntity_SC. */
export class P_MmoSyncEntity_SC {

    /**
     * Constructs a new P_MmoSyncEntity_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoSyncEntity_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoSyncEntity_SC obj_id. */
    obj_id?: (number|null);

    /** P_MmoSyncEntity_SC owner_uid. */
    owner_uid?: (number|null);

    /** P_MmoSyncEntity_SC obj_type. */
    obj_type?: (number|null);

    /** P_MmoSyncEntity_SC x. */
    x?: (number|null);

    /** P_MmoSyncEntity_SC y. */
    y?: (number|null);

    /** P_MmoSyncEntity_SC z. */
    z?: (number|null);

    /** P_MmoSyncEntity_SC role_name. */
    role_name?: (string|null);

    /** P_MmoSyncEntity_SC level. */
    level?: (number|null);

    /** P_MmoSyncEntity_SC hp. */
    hp?: (number|null);

    /** P_MmoSyncEntity_SC max_hp. */
    max_hp?: (number|null);

    /** P_MmoSyncEntity_SC dead. */
    dead?: (boolean|null);

    /**
     * Creates a new P_MmoSyncEntity_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoSyncEntity_SC instance
     */
    static create(properties: P_MmoSyncEntity_SC.$Shape): P_MmoSyncEntity_SC & P_MmoSyncEntity_SC.$Shape;
    static create(properties?: P_MmoSyncEntity_SC.$Properties): P_MmoSyncEntity_SC;

    /**
     * Encodes the specified P_MmoSyncEntity_SC message. Does not implicitly {@link P_MmoSyncEntity_SC.verify|verify} messages.
     * @param message P_MmoSyncEntity_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoSyncEntity_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoSyncEntity_SC message, length delimited. Does not implicitly {@link P_MmoSyncEntity_SC.verify|verify} messages.
     * @param message P_MmoSyncEntity_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoSyncEntity_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoSyncEntity_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoSyncEntity_SC & P_MmoSyncEntity_SC.$Shape} P_MmoSyncEntity_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoSyncEntity_SC & P_MmoSyncEntity_SC.$Shape;

    /**
     * Decodes a P_MmoSyncEntity_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoSyncEntity_SC & P_MmoSyncEntity_SC.$Shape} P_MmoSyncEntity_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoSyncEntity_SC & P_MmoSyncEntity_SC.$Shape;

    /**
     * Verifies a P_MmoSyncEntity_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoSyncEntity_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoSyncEntity_SC
     */
    static fromObject(object: { [k: string]: any }): P_MmoSyncEntity_SC;

    /**
     * Creates a plain object from a P_MmoSyncEntity_SC message. Also converts values to other types if specified.
     * @param message P_MmoSyncEntity_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoSyncEntity_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoSyncEntity_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoSyncEntity_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoSyncEntity_SC {

    /** Properties of a P_MmoSyncEntity_SC. */
    interface $Properties {

        /** P_MmoSyncEntity_SC obj_id */
        obj_id?: (number|null);

        /** P_MmoSyncEntity_SC owner_uid */
        owner_uid?: (number|null);

        /** P_MmoSyncEntity_SC obj_type */
        obj_type?: (number|null);

        /** P_MmoSyncEntity_SC x */
        x?: (number|null);

        /** P_MmoSyncEntity_SC y */
        y?: (number|null);

        /** P_MmoSyncEntity_SC z */
        z?: (number|null);

        /** P_MmoSyncEntity_SC role_name */
        role_name?: (string|null);

        /** P_MmoSyncEntity_SC level */
        level?: (number|null);

        /** P_MmoSyncEntity_SC hp */
        hp?: (number|null);

        /** P_MmoSyncEntity_SC max_hp */
        max_hp?: (number|null);

        /** P_MmoSyncEntity_SC dead */
        dead?: (boolean|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoSyncEntity_SC. */
    type $Shape = P_MmoSyncEntity_SC.$Properties;
}

/**
 * Properties of a P_MmoSyncLeaveEntity_SC.
 * @deprecated Use P_MmoSyncLeaveEntity_SC.$Properties instead.
 */
export interface IP_MmoSyncLeaveEntity_SC extends P_MmoSyncLeaveEntity_SC.$Properties {
}

/** Represents a P_MmoSyncLeaveEntity_SC. */
export class P_MmoSyncLeaveEntity_SC {

    /**
     * Constructs a new P_MmoSyncLeaveEntity_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoSyncLeaveEntity_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoSyncLeaveEntity_SC obj_id. */
    obj_id?: (number|null);

    /**
     * Creates a new P_MmoSyncLeaveEntity_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoSyncLeaveEntity_SC instance
     */
    static create(properties: P_MmoSyncLeaveEntity_SC.$Shape): P_MmoSyncLeaveEntity_SC & P_MmoSyncLeaveEntity_SC.$Shape;
    static create(properties?: P_MmoSyncLeaveEntity_SC.$Properties): P_MmoSyncLeaveEntity_SC;

    /**
     * Encodes the specified P_MmoSyncLeaveEntity_SC message. Does not implicitly {@link P_MmoSyncLeaveEntity_SC.verify|verify} messages.
     * @param message P_MmoSyncLeaveEntity_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoSyncLeaveEntity_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoSyncLeaveEntity_SC message, length delimited. Does not implicitly {@link P_MmoSyncLeaveEntity_SC.verify|verify} messages.
     * @param message P_MmoSyncLeaveEntity_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoSyncLeaveEntity_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoSyncLeaveEntity_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoSyncLeaveEntity_SC & P_MmoSyncLeaveEntity_SC.$Shape} P_MmoSyncLeaveEntity_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoSyncLeaveEntity_SC & P_MmoSyncLeaveEntity_SC.$Shape;

    /**
     * Decodes a P_MmoSyncLeaveEntity_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoSyncLeaveEntity_SC & P_MmoSyncLeaveEntity_SC.$Shape} P_MmoSyncLeaveEntity_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoSyncLeaveEntity_SC & P_MmoSyncLeaveEntity_SC.$Shape;

    /**
     * Verifies a P_MmoSyncLeaveEntity_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoSyncLeaveEntity_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoSyncLeaveEntity_SC
     */
    static fromObject(object: { [k: string]: any }): P_MmoSyncLeaveEntity_SC;

    /**
     * Creates a plain object from a P_MmoSyncLeaveEntity_SC message. Also converts values to other types if specified.
     * @param message P_MmoSyncLeaveEntity_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoSyncLeaveEntity_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoSyncLeaveEntity_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoSyncLeaveEntity_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoSyncLeaveEntity_SC {

    /** Properties of a P_MmoSyncLeaveEntity_SC. */
    interface $Properties {

        /** P_MmoSyncLeaveEntity_SC obj_id */
        obj_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoSyncLeaveEntity_SC. */
    type $Shape = P_MmoSyncLeaveEntity_SC.$Properties;
}

/**
 * Properties of a P_MmoSyncMove_SC.
 * @deprecated Use P_MmoSyncMove_SC.$Properties instead.
 */
export interface IP_MmoSyncMove_SC extends P_MmoSyncMove_SC.$Properties {
}

/** Represents a P_MmoSyncMove_SC. */
export class P_MmoSyncMove_SC {

    /**
     * Constructs a new P_MmoSyncMove_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoSyncMove_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoSyncMove_SC obj_id. */
    obj_id?: (number|null);

    /** P_MmoSyncMove_SC x. */
    x?: (number|null);

    /** P_MmoSyncMove_SC y. */
    y?: (number|null);

    /** P_MmoSyncMove_SC z. */
    z?: (number|null);

    /**
     * Creates a new P_MmoSyncMove_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoSyncMove_SC instance
     */
    static create(properties: P_MmoSyncMove_SC.$Shape): P_MmoSyncMove_SC & P_MmoSyncMove_SC.$Shape;
    static create(properties?: P_MmoSyncMove_SC.$Properties): P_MmoSyncMove_SC;

    /**
     * Encodes the specified P_MmoSyncMove_SC message. Does not implicitly {@link P_MmoSyncMove_SC.verify|verify} messages.
     * @param message P_MmoSyncMove_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoSyncMove_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoSyncMove_SC message, length delimited. Does not implicitly {@link P_MmoSyncMove_SC.verify|verify} messages.
     * @param message P_MmoSyncMove_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoSyncMove_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoSyncMove_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoSyncMove_SC & P_MmoSyncMove_SC.$Shape} P_MmoSyncMove_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoSyncMove_SC & P_MmoSyncMove_SC.$Shape;

    /**
     * Decodes a P_MmoSyncMove_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoSyncMove_SC & P_MmoSyncMove_SC.$Shape} P_MmoSyncMove_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoSyncMove_SC & P_MmoSyncMove_SC.$Shape;

    /**
     * Verifies a P_MmoSyncMove_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoSyncMove_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoSyncMove_SC
     */
    static fromObject(object: { [k: string]: any }): P_MmoSyncMove_SC;

    /**
     * Creates a plain object from a P_MmoSyncMove_SC message. Also converts values to other types if specified.
     * @param message P_MmoSyncMove_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoSyncMove_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoSyncMove_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoSyncMove_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoSyncMove_SC {

    /** Properties of a P_MmoSyncMove_SC. */
    interface $Properties {

        /** P_MmoSyncMove_SC obj_id */
        obj_id?: (number|null);

        /** P_MmoSyncMove_SC x */
        x?: (number|null);

        /** P_MmoSyncMove_SC y */
        y?: (number|null);

        /** P_MmoSyncMove_SC z */
        z?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoSyncMove_SC. */
    type $Shape = P_MmoSyncMove_SC.$Properties;
}

/**
 * Properties of a P_MmoAttack_CS.
 * @deprecated Use P_MmoAttack_CS.$Properties instead.
 */
export interface IP_MmoAttack_CS extends P_MmoAttack_CS.$Properties {
}

/** Represents a P_MmoAttack_CS. */
export class P_MmoAttack_CS {

    /**
     * Constructs a new P_MmoAttack_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoAttack_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoAttack_CS target_obj_id. */
    target_obj_id?: (number|null);

    /**
     * Creates a new P_MmoAttack_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoAttack_CS instance
     */
    static create(properties: P_MmoAttack_CS.$Shape): P_MmoAttack_CS & P_MmoAttack_CS.$Shape;
    static create(properties?: P_MmoAttack_CS.$Properties): P_MmoAttack_CS;

    /**
     * Encodes the specified P_MmoAttack_CS message. Does not implicitly {@link P_MmoAttack_CS.verify|verify} messages.
     * @param message P_MmoAttack_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoAttack_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoAttack_CS message, length delimited. Does not implicitly {@link P_MmoAttack_CS.verify|verify} messages.
     * @param message P_MmoAttack_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoAttack_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoAttack_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoAttack_CS & P_MmoAttack_CS.$Shape} P_MmoAttack_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoAttack_CS & P_MmoAttack_CS.$Shape;

    /**
     * Decodes a P_MmoAttack_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoAttack_CS & P_MmoAttack_CS.$Shape} P_MmoAttack_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoAttack_CS & P_MmoAttack_CS.$Shape;

    /**
     * Verifies a P_MmoAttack_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoAttack_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoAttack_CS
     */
    static fromObject(object: { [k: string]: any }): P_MmoAttack_CS;

    /**
     * Creates a plain object from a P_MmoAttack_CS message. Also converts values to other types if specified.
     * @param message P_MmoAttack_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoAttack_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoAttack_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoAttack_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoAttack_CS {

    /** Properties of a P_MmoAttack_CS. */
    interface $Properties {

        /** P_MmoAttack_CS target_obj_id */
        target_obj_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoAttack_CS. */
    type $Shape = P_MmoAttack_CS.$Properties;
}

/**
 * Properties of a P_MmoSkill_CS.
 * @deprecated Use P_MmoSkill_CS.$Properties instead.
 */
export interface IP_MmoSkill_CS extends P_MmoSkill_CS.$Properties {
}

/** Represents a P_MmoSkill_CS. */
export class P_MmoSkill_CS {

    /**
     * Constructs a new P_MmoSkill_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoSkill_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoSkill_CS skill_id. */
    skill_id?: (number|null);

    /** P_MmoSkill_CS target_obj_id. */
    target_obj_id?: (number|null);

    /**
     * Creates a new P_MmoSkill_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoSkill_CS instance
     */
    static create(properties: P_MmoSkill_CS.$Shape): P_MmoSkill_CS & P_MmoSkill_CS.$Shape;
    static create(properties?: P_MmoSkill_CS.$Properties): P_MmoSkill_CS;

    /**
     * Encodes the specified P_MmoSkill_CS message. Does not implicitly {@link P_MmoSkill_CS.verify|verify} messages.
     * @param message P_MmoSkill_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoSkill_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoSkill_CS message, length delimited. Does not implicitly {@link P_MmoSkill_CS.verify|verify} messages.
     * @param message P_MmoSkill_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoSkill_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoSkill_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoSkill_CS & P_MmoSkill_CS.$Shape} P_MmoSkill_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoSkill_CS & P_MmoSkill_CS.$Shape;

    /**
     * Decodes a P_MmoSkill_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoSkill_CS & P_MmoSkill_CS.$Shape} P_MmoSkill_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoSkill_CS & P_MmoSkill_CS.$Shape;

    /**
     * Verifies a P_MmoSkill_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoSkill_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoSkill_CS
     */
    static fromObject(object: { [k: string]: any }): P_MmoSkill_CS;

    /**
     * Creates a plain object from a P_MmoSkill_CS message. Also converts values to other types if specified.
     * @param message P_MmoSkill_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoSkill_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoSkill_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoSkill_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoSkill_CS {

    /** Properties of a P_MmoSkill_CS. */
    interface $Properties {

        /** P_MmoSkill_CS skill_id */
        skill_id?: (number|null);

        /** P_MmoSkill_CS target_obj_id */
        target_obj_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoSkill_CS. */
    type $Shape = P_MmoSkill_CS.$Properties;
}

/**
 * Properties of a P_MmoDamage_SC.
 * @deprecated Use P_MmoDamage_SC.$Properties instead.
 */
export interface IP_MmoDamage_SC extends P_MmoDamage_SC.$Properties {
}

/** Represents a P_MmoDamage_SC. */
export class P_MmoDamage_SC {

    /**
     * Constructs a new P_MmoDamage_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoDamage_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoDamage_SC obj_id. */
    obj_id?: (number|null);

    /** P_MmoDamage_SC attacker_uid. */
    attacker_uid?: (number|null);

    /** P_MmoDamage_SC damage. */
    damage?: (number|null);

    /** P_MmoDamage_SC hp. */
    hp?: (number|null);

    /** P_MmoDamage_SC dead. */
    dead?: (boolean|null);

    /**
     * Creates a new P_MmoDamage_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoDamage_SC instance
     */
    static create(properties: P_MmoDamage_SC.$Shape): P_MmoDamage_SC & P_MmoDamage_SC.$Shape;
    static create(properties?: P_MmoDamage_SC.$Properties): P_MmoDamage_SC;

    /**
     * Encodes the specified P_MmoDamage_SC message. Does not implicitly {@link P_MmoDamage_SC.verify|verify} messages.
     * @param message P_MmoDamage_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoDamage_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoDamage_SC message, length delimited. Does not implicitly {@link P_MmoDamage_SC.verify|verify} messages.
     * @param message P_MmoDamage_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoDamage_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoDamage_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoDamage_SC & P_MmoDamage_SC.$Shape} P_MmoDamage_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoDamage_SC & P_MmoDamage_SC.$Shape;

    /**
     * Decodes a P_MmoDamage_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoDamage_SC & P_MmoDamage_SC.$Shape} P_MmoDamage_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoDamage_SC & P_MmoDamage_SC.$Shape;

    /**
     * Verifies a P_MmoDamage_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoDamage_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoDamage_SC
     */
    static fromObject(object: { [k: string]: any }): P_MmoDamage_SC;

    /**
     * Creates a plain object from a P_MmoDamage_SC message. Also converts values to other types if specified.
     * @param message P_MmoDamage_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoDamage_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoDamage_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoDamage_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoDamage_SC {

    /** Properties of a P_MmoDamage_SC. */
    interface $Properties {

        /** P_MmoDamage_SC obj_id */
        obj_id?: (number|null);

        /** P_MmoDamage_SC attacker_uid */
        attacker_uid?: (number|null);

        /** P_MmoDamage_SC damage */
        damage?: (number|null);

        /** P_MmoDamage_SC hp */
        hp?: (number|null);

        /** P_MmoDamage_SC dead */
        dead?: (boolean|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoDamage_SC. */
    type $Shape = P_MmoDamage_SC.$Properties;
}

/**
 * Properties of a P_MmoRoleState_SC.
 * @deprecated Use P_MmoRoleState_SC.$Properties instead.
 */
export interface IP_MmoRoleState_SC extends P_MmoRoleState_SC.$Properties {
}

/** Represents a P_MmoRoleState_SC. */
export class P_MmoRoleState_SC {

    /**
     * Constructs a new P_MmoRoleState_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_MmoRoleState_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_MmoRoleState_SC obj_id. */
    obj_id?: (number|null);

    /** P_MmoRoleState_SC owner_uid. */
    owner_uid?: (number|null);

    /** P_MmoRoleState_SC hp. */
    hp?: (number|null);

    /** P_MmoRoleState_SC max_hp. */
    max_hp?: (number|null);

    /** P_MmoRoleState_SC dead. */
    dead?: (boolean|null);

    /** P_MmoRoleState_SC value. */
    value?: (number|null);

    /**
     * Creates a new P_MmoRoleState_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_MmoRoleState_SC instance
     */
    static create(properties: P_MmoRoleState_SC.$Shape): P_MmoRoleState_SC & P_MmoRoleState_SC.$Shape;
    static create(properties?: P_MmoRoleState_SC.$Properties): P_MmoRoleState_SC;

    /**
     * Encodes the specified P_MmoRoleState_SC message. Does not implicitly {@link P_MmoRoleState_SC.verify|verify} messages.
     * @param message P_MmoRoleState_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_MmoRoleState_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_MmoRoleState_SC message, length delimited. Does not implicitly {@link P_MmoRoleState_SC.verify|verify} messages.
     * @param message P_MmoRoleState_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_MmoRoleState_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_MmoRoleState_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_MmoRoleState_SC & P_MmoRoleState_SC.$Shape} P_MmoRoleState_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_MmoRoleState_SC & P_MmoRoleState_SC.$Shape;

    /**
     * Decodes a P_MmoRoleState_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_MmoRoleState_SC & P_MmoRoleState_SC.$Shape} P_MmoRoleState_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_MmoRoleState_SC & P_MmoRoleState_SC.$Shape;

    /**
     * Verifies a P_MmoRoleState_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_MmoRoleState_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_MmoRoleState_SC
     */
    static fromObject(object: { [k: string]: any }): P_MmoRoleState_SC;

    /**
     * Creates a plain object from a P_MmoRoleState_SC message. Also converts values to other types if specified.
     * @param message P_MmoRoleState_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_MmoRoleState_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_MmoRoleState_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_MmoRoleState_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_MmoRoleState_SC {

    /** Properties of a P_MmoRoleState_SC. */
    interface $Properties {

        /** P_MmoRoleState_SC obj_id */
        obj_id?: (number|null);

        /** P_MmoRoleState_SC owner_uid */
        owner_uid?: (number|null);

        /** P_MmoRoleState_SC hp */
        hp?: (number|null);

        /** P_MmoRoleState_SC max_hp */
        max_hp?: (number|null);

        /** P_MmoRoleState_SC dead */
        dead?: (boolean|null);

        /** P_MmoRoleState_SC value */
        value?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_MmoRoleState_SC. */
    type $Shape = P_MmoRoleState_SC.$Properties;
}

/**
 * Properties of a P_CrossEnter_CS.
 * @deprecated Use P_CrossEnter_CS.$Properties instead.
 */
export interface IP_CrossEnter_CS extends P_CrossEnter_CS.$Properties {
}

/** Represents a P_CrossEnter_CS. */
export class P_CrossEnter_CS {

    /**
     * Constructs a new P_CrossEnter_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_CrossEnter_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_CrossEnter_CS cross_type. */
    cross_type?: (number|null);

    /** P_CrossEnter_CS activity_id. */
    activity_id?: (number|null);

    /**
     * Creates a new P_CrossEnter_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_CrossEnter_CS instance
     */
    static create(properties: P_CrossEnter_CS.$Shape): P_CrossEnter_CS & P_CrossEnter_CS.$Shape;
    static create(properties?: P_CrossEnter_CS.$Properties): P_CrossEnter_CS;

    /**
     * Encodes the specified P_CrossEnter_CS message. Does not implicitly {@link P_CrossEnter_CS.verify|verify} messages.
     * @param message P_CrossEnter_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_CrossEnter_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_CrossEnter_CS message, length delimited. Does not implicitly {@link P_CrossEnter_CS.verify|verify} messages.
     * @param message P_CrossEnter_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_CrossEnter_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_CrossEnter_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_CrossEnter_CS & P_CrossEnter_CS.$Shape} P_CrossEnter_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_CrossEnter_CS & P_CrossEnter_CS.$Shape;

    /**
     * Decodes a P_CrossEnter_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_CrossEnter_CS & P_CrossEnter_CS.$Shape} P_CrossEnter_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_CrossEnter_CS & P_CrossEnter_CS.$Shape;

    /**
     * Verifies a P_CrossEnter_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_CrossEnter_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_CrossEnter_CS
     */
    static fromObject(object: { [k: string]: any }): P_CrossEnter_CS;

    /**
     * Creates a plain object from a P_CrossEnter_CS message. Also converts values to other types if specified.
     * @param message P_CrossEnter_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_CrossEnter_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_CrossEnter_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_CrossEnter_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_CrossEnter_CS {

    /** Properties of a P_CrossEnter_CS. */
    interface $Properties {

        /** P_CrossEnter_CS cross_type */
        cross_type?: (number|null);

        /** P_CrossEnter_CS activity_id */
        activity_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_CrossEnter_CS. */
    type $Shape = P_CrossEnter_CS.$Properties;
}

/**
 * Properties of a P_CrossEnter_SC.
 * @deprecated Use P_CrossEnter_SC.$Properties instead.
 */
export interface IP_CrossEnter_SC extends P_CrossEnter_SC.$Properties {
}

/** Represents a P_CrossEnter_SC. */
export class P_CrossEnter_SC {

    /**
     * Constructs a new P_CrossEnter_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_CrossEnter_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_CrossEnter_SC success. */
    success?: (boolean|null);

    /** P_CrossEnter_SC error. */
    error?: (string|null);

    /** P_CrossEnter_SC scene_ip. */
    scene_ip?: (string|null);

    /** P_CrossEnter_SC scene_port. */
    scene_port?: (number|null);

    /** P_CrossEnter_SC token. */
    token?: (string|null);

    /** P_CrossEnter_SC expire_time. */
    expire_time?: (number|null);

    /** P_CrossEnter_SC cross_type. */
    cross_type?: (number|null);

    /**
     * Creates a new P_CrossEnter_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_CrossEnter_SC instance
     */
    static create(properties: P_CrossEnter_SC.$Shape): P_CrossEnter_SC & P_CrossEnter_SC.$Shape;
    static create(properties?: P_CrossEnter_SC.$Properties): P_CrossEnter_SC;

    /**
     * Encodes the specified P_CrossEnter_SC message. Does not implicitly {@link P_CrossEnter_SC.verify|verify} messages.
     * @param message P_CrossEnter_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_CrossEnter_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_CrossEnter_SC message, length delimited. Does not implicitly {@link P_CrossEnter_SC.verify|verify} messages.
     * @param message P_CrossEnter_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_CrossEnter_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_CrossEnter_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_CrossEnter_SC & P_CrossEnter_SC.$Shape} P_CrossEnter_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_CrossEnter_SC & P_CrossEnter_SC.$Shape;

    /**
     * Decodes a P_CrossEnter_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_CrossEnter_SC & P_CrossEnter_SC.$Shape} P_CrossEnter_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_CrossEnter_SC & P_CrossEnter_SC.$Shape;

    /**
     * Verifies a P_CrossEnter_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_CrossEnter_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_CrossEnter_SC
     */
    static fromObject(object: { [k: string]: any }): P_CrossEnter_SC;

    /**
     * Creates a plain object from a P_CrossEnter_SC message. Also converts values to other types if specified.
     * @param message P_CrossEnter_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_CrossEnter_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_CrossEnter_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_CrossEnter_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_CrossEnter_SC {

    /** Properties of a P_CrossEnter_SC. */
    interface $Properties {

        /** P_CrossEnter_SC success */
        success?: (boolean|null);

        /** P_CrossEnter_SC error */
        error?: (string|null);

        /** P_CrossEnter_SC scene_ip */
        scene_ip?: (string|null);

        /** P_CrossEnter_SC scene_port */
        scene_port?: (number|null);

        /** P_CrossEnter_SC token */
        token?: (string|null);

        /** P_CrossEnter_SC expire_time */
        expire_time?: (number|null);

        /** P_CrossEnter_SC cross_type */
        cross_type?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_CrossEnter_SC. */
    type $Shape = P_CrossEnter_SC.$Properties;
}

/**
 * Properties of a P_CrossAuth_CS.
 * @deprecated Use P_CrossAuth_CS.$Properties instead.
 */
export interface IP_CrossAuth_CS extends P_CrossAuth_CS.$Properties {
}

/** Represents a P_CrossAuth_CS. */
export class P_CrossAuth_CS {

    /**
     * Constructs a new P_CrossAuth_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_CrossAuth_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_CrossAuth_CS role_uid. */
    role_uid?: (number|null);

    /** P_CrossAuth_CS token. */
    token?: (string|null);

    /**
     * Creates a new P_CrossAuth_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_CrossAuth_CS instance
     */
    static create(properties: P_CrossAuth_CS.$Shape): P_CrossAuth_CS & P_CrossAuth_CS.$Shape;
    static create(properties?: P_CrossAuth_CS.$Properties): P_CrossAuth_CS;

    /**
     * Encodes the specified P_CrossAuth_CS message. Does not implicitly {@link P_CrossAuth_CS.verify|verify} messages.
     * @param message P_CrossAuth_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_CrossAuth_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_CrossAuth_CS message, length delimited. Does not implicitly {@link P_CrossAuth_CS.verify|verify} messages.
     * @param message P_CrossAuth_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_CrossAuth_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_CrossAuth_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_CrossAuth_CS & P_CrossAuth_CS.$Shape} P_CrossAuth_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_CrossAuth_CS & P_CrossAuth_CS.$Shape;

    /**
     * Decodes a P_CrossAuth_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_CrossAuth_CS & P_CrossAuth_CS.$Shape} P_CrossAuth_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_CrossAuth_CS & P_CrossAuth_CS.$Shape;

    /**
     * Verifies a P_CrossAuth_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_CrossAuth_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_CrossAuth_CS
     */
    static fromObject(object: { [k: string]: any }): P_CrossAuth_CS;

    /**
     * Creates a plain object from a P_CrossAuth_CS message. Also converts values to other types if specified.
     * @param message P_CrossAuth_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_CrossAuth_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_CrossAuth_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_CrossAuth_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_CrossAuth_CS {

    /** Properties of a P_CrossAuth_CS. */
    interface $Properties {

        /** P_CrossAuth_CS role_uid */
        role_uid?: (number|null);

        /** P_CrossAuth_CS token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_CrossAuth_CS. */
    type $Shape = P_CrossAuth_CS.$Properties;
}

/**
 * Properties of a P_CrossAuth_SC.
 * @deprecated Use P_CrossAuth_SC.$Properties instead.
 */
export interface IP_CrossAuth_SC extends P_CrossAuth_SC.$Properties {
}

/** Represents a P_CrossAuth_SC. */
export class P_CrossAuth_SC {

    /**
     * Constructs a new P_CrossAuth_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_CrossAuth_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_CrossAuth_SC success. */
    success?: (boolean|null);

    /** P_CrossAuth_SC error. */
    error?: (string|null);

    /**
     * Creates a new P_CrossAuth_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_CrossAuth_SC instance
     */
    static create(properties: P_CrossAuth_SC.$Shape): P_CrossAuth_SC & P_CrossAuth_SC.$Shape;
    static create(properties?: P_CrossAuth_SC.$Properties): P_CrossAuth_SC;

    /**
     * Encodes the specified P_CrossAuth_SC message. Does not implicitly {@link P_CrossAuth_SC.verify|verify} messages.
     * @param message P_CrossAuth_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_CrossAuth_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_CrossAuth_SC message, length delimited. Does not implicitly {@link P_CrossAuth_SC.verify|verify} messages.
     * @param message P_CrossAuth_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_CrossAuth_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_CrossAuth_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_CrossAuth_SC & P_CrossAuth_SC.$Shape} P_CrossAuth_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_CrossAuth_SC & P_CrossAuth_SC.$Shape;

    /**
     * Decodes a P_CrossAuth_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_CrossAuth_SC & P_CrossAuth_SC.$Shape} P_CrossAuth_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_CrossAuth_SC & P_CrossAuth_SC.$Shape;

    /**
     * Verifies a P_CrossAuth_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_CrossAuth_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_CrossAuth_SC
     */
    static fromObject(object: { [k: string]: any }): P_CrossAuth_SC;

    /**
     * Creates a plain object from a P_CrossAuth_SC message. Also converts values to other types if specified.
     * @param message P_CrossAuth_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_CrossAuth_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_CrossAuth_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_CrossAuth_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_CrossAuth_SC {

    /** Properties of a P_CrossAuth_SC. */
    interface $Properties {

        /** P_CrossAuth_SC success */
        success?: (boolean|null);

        /** P_CrossAuth_SC error */
        error?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_CrossAuth_SC. */
    type $Shape = P_CrossAuth_SC.$Properties;
}

/**
 * Properties of a P_LoginReq_CS.
 * @deprecated Use P_LoginReq_CS.$Properties instead.
 */
export interface IP_LoginReq_CS extends P_LoginReq_CS.$Properties {
}

/** Represents a P_LoginReq_CS. */
export class P_LoginReq_CS {

    /**
     * Constructs a new P_LoginReq_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_LoginReq_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_LoginReq_CS login_user_name. */
    login_user_name?: (string|null);

    /** P_LoginReq_CS token. */
    token?: (string|null);

    /**
     * Creates a new P_LoginReq_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_LoginReq_CS instance
     */
    static create(properties: P_LoginReq_CS.$Shape): P_LoginReq_CS & P_LoginReq_CS.$Shape;
    static create(properties?: P_LoginReq_CS.$Properties): P_LoginReq_CS;

    /**
     * Encodes the specified P_LoginReq_CS message. Does not implicitly {@link P_LoginReq_CS.verify|verify} messages.
     * @param message P_LoginReq_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_LoginReq_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_LoginReq_CS message, length delimited. Does not implicitly {@link P_LoginReq_CS.verify|verify} messages.
     * @param message P_LoginReq_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_LoginReq_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_LoginReq_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_LoginReq_CS & P_LoginReq_CS.$Shape} P_LoginReq_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_LoginReq_CS & P_LoginReq_CS.$Shape;

    /**
     * Decodes a P_LoginReq_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_LoginReq_CS & P_LoginReq_CS.$Shape} P_LoginReq_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_LoginReq_CS & P_LoginReq_CS.$Shape;

    /**
     * Verifies a P_LoginReq_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_LoginReq_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_LoginReq_CS
     */
    static fromObject(object: { [k: string]: any }): P_LoginReq_CS;

    /**
     * Creates a plain object from a P_LoginReq_CS message. Also converts values to other types if specified.
     * @param message P_LoginReq_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_LoginReq_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_LoginReq_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_LoginReq_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_LoginReq_CS {

    /** Properties of a P_LoginReq_CS. */
    interface $Properties {

        /** P_LoginReq_CS login_user_name */
        login_user_name?: (string|null);

        /** P_LoginReq_CS token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_LoginReq_CS. */
    type $Shape = P_LoginReq_CS.$Properties;
}

/**
 * Properties of a P_LoginReq_SC.
 * @deprecated Use P_LoginReq_SC.$Properties instead.
 */
export interface IP_LoginReq_SC extends P_LoginReq_SC.$Properties {
}

/** Represents a P_LoginReq_SC. */
export class P_LoginReq_SC {

    /**
     * Constructs a new P_LoginReq_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_LoginReq_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_LoginReq_SC error_message. */
    error_message?: (string|null);

    /** P_LoginReq_SC token. */
    token?: (string|null);

    /**
     * Creates a new P_LoginReq_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_LoginReq_SC instance
     */
    static create(properties: P_LoginReq_SC.$Shape): P_LoginReq_SC & P_LoginReq_SC.$Shape;
    static create(properties?: P_LoginReq_SC.$Properties): P_LoginReq_SC;

    /**
     * Encodes the specified P_LoginReq_SC message. Does not implicitly {@link P_LoginReq_SC.verify|verify} messages.
     * @param message P_LoginReq_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_LoginReq_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_LoginReq_SC message, length delimited. Does not implicitly {@link P_LoginReq_SC.verify|verify} messages.
     * @param message P_LoginReq_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_LoginReq_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_LoginReq_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_LoginReq_SC & P_LoginReq_SC.$Shape} P_LoginReq_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_LoginReq_SC & P_LoginReq_SC.$Shape;

    /**
     * Decodes a P_LoginReq_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_LoginReq_SC & P_LoginReq_SC.$Shape} P_LoginReq_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_LoginReq_SC & P_LoginReq_SC.$Shape;

    /**
     * Verifies a P_LoginReq_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_LoginReq_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_LoginReq_SC
     */
    static fromObject(object: { [k: string]: any }): P_LoginReq_SC;

    /**
     * Creates a plain object from a P_LoginReq_SC message. Also converts values to other types if specified.
     * @param message P_LoginReq_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_LoginReq_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_LoginReq_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_LoginReq_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_LoginReq_SC {

    /** Properties of a P_LoginReq_SC. */
    interface $Properties {

        /** P_LoginReq_SC error_message */
        error_message?: (string|null);

        /** P_LoginReq_SC token */
        token?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_LoginReq_SC. */
    type $Shape = P_LoginReq_SC.$Properties;
}

/**
 * Properties of a P_GM_CS.
 * @deprecated Use P_GM_CS.$Properties instead.
 */
export interface IP_GM_CS extends P_GM_CS.$Properties {
}

/** Represents a P_GM_CS. */
export class P_GM_CS {

    /**
     * Constructs a new P_GM_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_GM_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_GM_CS params. */
    params?: (string|null);

    /**
     * Creates a new P_GM_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_GM_CS instance
     */
    static create(properties: P_GM_CS.$Shape): P_GM_CS & P_GM_CS.$Shape;
    static create(properties?: P_GM_CS.$Properties): P_GM_CS;

    /**
     * Encodes the specified P_GM_CS message. Does not implicitly {@link P_GM_CS.verify|verify} messages.
     * @param message P_GM_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_GM_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_GM_CS message, length delimited. Does not implicitly {@link P_GM_CS.verify|verify} messages.
     * @param message P_GM_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_GM_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_GM_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_GM_CS & P_GM_CS.$Shape} P_GM_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_GM_CS & P_GM_CS.$Shape;

    /**
     * Decodes a P_GM_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_GM_CS & P_GM_CS.$Shape} P_GM_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_GM_CS & P_GM_CS.$Shape;

    /**
     * Verifies a P_GM_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_GM_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_GM_CS
     */
    static fromObject(object: { [k: string]: any }): P_GM_CS;

    /**
     * Creates a plain object from a P_GM_CS message. Also converts values to other types if specified.
     * @param message P_GM_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_GM_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_GM_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_GM_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_GM_CS {

    /** Properties of a P_GM_CS. */
    interface $Properties {

        /** P_GM_CS params */
        params?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_GM_CS. */
    type $Shape = P_GM_CS.$Properties;
}

/**
 * Properties of a P_GM_SC.
 * @deprecated Use P_GM_SC.$Properties instead.
 */
export interface IP_GM_SC extends P_GM_SC.$Properties {
}

/** Represents a P_GM_SC. */
export class P_GM_SC {

    /**
     * Constructs a new P_GM_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_GM_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_GM_SC params. */
    params?: (string|null);

    /** P_GM_SC ret. */
    ret?: (number|null);

    /**
     * Creates a new P_GM_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_GM_SC instance
     */
    static create(properties: P_GM_SC.$Shape): P_GM_SC & P_GM_SC.$Shape;
    static create(properties?: P_GM_SC.$Properties): P_GM_SC;

    /**
     * Encodes the specified P_GM_SC message. Does not implicitly {@link P_GM_SC.verify|verify} messages.
     * @param message P_GM_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_GM_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_GM_SC message, length delimited. Does not implicitly {@link P_GM_SC.verify|verify} messages.
     * @param message P_GM_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_GM_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_GM_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_GM_SC & P_GM_SC.$Shape} P_GM_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_GM_SC & P_GM_SC.$Shape;

    /**
     * Decodes a P_GM_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_GM_SC & P_GM_SC.$Shape} P_GM_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_GM_SC & P_GM_SC.$Shape;

    /**
     * Verifies a P_GM_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_GM_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_GM_SC
     */
    static fromObject(object: { [k: string]: any }): P_GM_SC;

    /**
     * Creates a plain object from a P_GM_SC message. Also converts values to other types if specified.
     * @param message P_GM_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_GM_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_GM_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_GM_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_GM_SC {

    /** Properties of a P_GM_SC. */
    interface $Properties {

        /** P_GM_SC params */
        params?: (string|null);

        /** P_GM_SC ret */
        ret?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_GM_SC. */
    type $Shape = P_GM_SC.$Properties;
}

/**
 * Properties of a P_BattleServer_CS.
 * @deprecated Use P_BattleServer_CS.$Properties instead.
 */
export interface IP_BattleServer_CS extends P_BattleServer_CS.$Properties {
}

/** Represents a P_BattleServer_CS. */
export class P_BattleServer_CS {

    /**
     * Constructs a new P_BattleServer_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServer_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServer_CS param. */
    param: number[];

    /**
     * Creates a new P_BattleServer_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServer_CS instance
     */
    static create(properties: P_BattleServer_CS.$Shape): P_BattleServer_CS & P_BattleServer_CS.$Shape;
    static create(properties?: P_BattleServer_CS.$Properties): P_BattleServer_CS;

    /**
     * Encodes the specified P_BattleServer_CS message. Does not implicitly {@link P_BattleServer_CS.verify|verify} messages.
     * @param message P_BattleServer_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServer_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServer_CS message, length delimited. Does not implicitly {@link P_BattleServer_CS.verify|verify} messages.
     * @param message P_BattleServer_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServer_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServer_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServer_CS & P_BattleServer_CS.$Shape} P_BattleServer_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServer_CS & P_BattleServer_CS.$Shape;

    /**
     * Decodes a P_BattleServer_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServer_CS & P_BattleServer_CS.$Shape} P_BattleServer_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServer_CS & P_BattleServer_CS.$Shape;

    /**
     * Verifies a P_BattleServer_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServer_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServer_CS
     */
    static fromObject(object: { [k: string]: any }): P_BattleServer_CS;

    /**
     * Creates a plain object from a P_BattleServer_CS message. Also converts values to other types if specified.
     * @param message P_BattleServer_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServer_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServer_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServer_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServer_CS {

    /** Properties of a P_BattleServer_CS. */
    interface $Properties {

        /** P_BattleServer_CS param */
        param?: (number[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServer_CS. */
    type $Shape = P_BattleServer_CS.$Properties;
}

/**
 * Properties of a P_BattleServer_SC.
 * @deprecated Use P_BattleServer_SC.$Properties instead.
 */
export interface IP_BattleServer_SC extends P_BattleServer_SC.$Properties {
}

/** Represents a P_BattleServer_SC. */
export class P_BattleServer_SC {

    /**
     * Constructs a new P_BattleServer_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_BattleServer_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_BattleServer_SC ret. */
    ret?: (number|null);

    /** P_BattleServer_SC server_ip. */
    server_ip?: (string|null);

    /** P_BattleServer_SC server_port. */
    server_port?: (number|null);

    /**
     * Creates a new P_BattleServer_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_BattleServer_SC instance
     */
    static create(properties: P_BattleServer_SC.$Shape): P_BattleServer_SC & P_BattleServer_SC.$Shape;
    static create(properties?: P_BattleServer_SC.$Properties): P_BattleServer_SC;

    /**
     * Encodes the specified P_BattleServer_SC message. Does not implicitly {@link P_BattleServer_SC.verify|verify} messages.
     * @param message P_BattleServer_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_BattleServer_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_BattleServer_SC message, length delimited. Does not implicitly {@link P_BattleServer_SC.verify|verify} messages.
     * @param message P_BattleServer_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_BattleServer_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_BattleServer_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_BattleServer_SC & P_BattleServer_SC.$Shape} P_BattleServer_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_BattleServer_SC & P_BattleServer_SC.$Shape;

    /**
     * Decodes a P_BattleServer_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_BattleServer_SC & P_BattleServer_SC.$Shape} P_BattleServer_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_BattleServer_SC & P_BattleServer_SC.$Shape;

    /**
     * Verifies a P_BattleServer_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_BattleServer_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_BattleServer_SC
     */
    static fromObject(object: { [k: string]: any }): P_BattleServer_SC;

    /**
     * Creates a plain object from a P_BattleServer_SC message. Also converts values to other types if specified.
     * @param message P_BattleServer_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_BattleServer_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_BattleServer_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_BattleServer_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_BattleServer_SC {

    /** Properties of a P_BattleServer_SC. */
    interface $Properties {

        /** P_BattleServer_SC ret */
        ret?: (number|null);

        /** P_BattleServer_SC server_ip */
        server_ip?: (string|null);

        /** P_BattleServer_SC server_port */
        server_port?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_BattleServer_SC. */
    type $Shape = P_BattleServer_SC.$Properties;
}

/**
 * Properties of a P_UserHeartbeat.
 * @deprecated Use P_UserHeartbeat.$Properties instead.
 */
export interface IP_UserHeartbeat extends P_UserHeartbeat.$Properties {
}

/** Represents a P_UserHeartbeat. */
export class P_UserHeartbeat {

    /**
     * Constructs a new P_UserHeartbeat.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_UserHeartbeat.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_UserHeartbeat time. */
    time?: (number|null);

    /**
     * Creates a new P_UserHeartbeat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_UserHeartbeat instance
     */
    static create(properties: P_UserHeartbeat.$Shape): P_UserHeartbeat & P_UserHeartbeat.$Shape;
    static create(properties?: P_UserHeartbeat.$Properties): P_UserHeartbeat;

    /**
     * Encodes the specified P_UserHeartbeat message. Does not implicitly {@link P_UserHeartbeat.verify|verify} messages.
     * @param message P_UserHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_UserHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_UserHeartbeat message, length delimited. Does not implicitly {@link P_UserHeartbeat.verify|verify} messages.
     * @param message P_UserHeartbeat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_UserHeartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_UserHeartbeat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_UserHeartbeat & P_UserHeartbeat.$Shape} P_UserHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_UserHeartbeat & P_UserHeartbeat.$Shape;

    /**
     * Decodes a P_UserHeartbeat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_UserHeartbeat & P_UserHeartbeat.$Shape} P_UserHeartbeat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_UserHeartbeat & P_UserHeartbeat.$Shape;

    /**
     * Verifies a P_UserHeartbeat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_UserHeartbeat message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_UserHeartbeat
     */
    static fromObject(object: { [k: string]: any }): P_UserHeartbeat;

    /**
     * Creates a plain object from a P_UserHeartbeat message. Also converts values to other types if specified.
     * @param message P_UserHeartbeat
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_UserHeartbeat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_UserHeartbeat to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_UserHeartbeat
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_UserHeartbeat {

    /** Properties of a P_UserHeartbeat. */
    interface $Properties {

        /** P_UserHeartbeat time */
        time?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_UserHeartbeat. */
    type $Shape = P_UserHeartbeat.$Properties;
}

/**
 * Properties of a P_SyncRoleInfoReq_CS.
 * @deprecated Use P_SyncRoleInfoReq_CS.$Properties instead.
 */
export interface IP_SyncRoleInfoReq_CS extends P_SyncRoleInfoReq_CS.$Properties {
}

/** Represents a P_SyncRoleInfoReq_CS. */
export class P_SyncRoleInfoReq_CS {

    /**
     * Constructs a new P_SyncRoleInfoReq_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncRoleInfoReq_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncRoleInfoReq_CS req_type. */
    req_type?: (number|null);

    /** P_SyncRoleInfoReq_CS token. */
    token?: (number|null);

    /** P_SyncRoleInfoReq_CS user_name. */
    user_name?: (string|null);

    /**
     * Creates a new P_SyncRoleInfoReq_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncRoleInfoReq_CS instance
     */
    static create(properties: P_SyncRoleInfoReq_CS.$Shape): P_SyncRoleInfoReq_CS & P_SyncRoleInfoReq_CS.$Shape;
    static create(properties?: P_SyncRoleInfoReq_CS.$Properties): P_SyncRoleInfoReq_CS;

    /**
     * Encodes the specified P_SyncRoleInfoReq_CS message. Does not implicitly {@link P_SyncRoleInfoReq_CS.verify|verify} messages.
     * @param message P_SyncRoleInfoReq_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncRoleInfoReq_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncRoleInfoReq_CS message, length delimited. Does not implicitly {@link P_SyncRoleInfoReq_CS.verify|verify} messages.
     * @param message P_SyncRoleInfoReq_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncRoleInfoReq_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncRoleInfoReq_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncRoleInfoReq_CS & P_SyncRoleInfoReq_CS.$Shape} P_SyncRoleInfoReq_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncRoleInfoReq_CS & P_SyncRoleInfoReq_CS.$Shape;

    /**
     * Decodes a P_SyncRoleInfoReq_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncRoleInfoReq_CS & P_SyncRoleInfoReq_CS.$Shape} P_SyncRoleInfoReq_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncRoleInfoReq_CS & P_SyncRoleInfoReq_CS.$Shape;

    /**
     * Verifies a P_SyncRoleInfoReq_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncRoleInfoReq_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncRoleInfoReq_CS
     */
    static fromObject(object: { [k: string]: any }): P_SyncRoleInfoReq_CS;

    /**
     * Creates a plain object from a P_SyncRoleInfoReq_CS message. Also converts values to other types if specified.
     * @param message P_SyncRoleInfoReq_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncRoleInfoReq_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncRoleInfoReq_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncRoleInfoReq_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncRoleInfoReq_CS {

    /** Properties of a P_SyncRoleInfoReq_CS. */
    interface $Properties {

        /** P_SyncRoleInfoReq_CS req_type */
        req_type?: (number|null);

        /** P_SyncRoleInfoReq_CS token */
        token?: (number|null);

        /** P_SyncRoleInfoReq_CS user_name */
        user_name?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncRoleInfoReq_CS. */
    type $Shape = P_SyncRoleInfoReq_CS.$Properties;
}

/**
 * Properties of a P_SyncRoleInfoRet_SC.
 * @deprecated Use P_SyncRoleInfoRet_SC.$Properties instead.
 */
export interface IP_SyncRoleInfoRet_SC extends P_SyncRoleInfoRet_SC.$Properties {
}

/** Represents a P_SyncRoleInfoRet_SC. */
export class P_SyncRoleInfoRet_SC {

    /**
     * Constructs a new P_SyncRoleInfoRet_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncRoleInfoRet_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncRoleInfoRet_SC role_base_info. */
    role_base_info?: (PB_RoleBaseInfo.$Properties|null);

    /** P_SyncRoleInfoRet_SC server_id. */
    server_id?: (number|null);

    /**
     * Creates a new P_SyncRoleInfoRet_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncRoleInfoRet_SC instance
     */
    static create(properties: P_SyncRoleInfoRet_SC.$Shape): P_SyncRoleInfoRet_SC & P_SyncRoleInfoRet_SC.$Shape;
    static create(properties?: P_SyncRoleInfoRet_SC.$Properties): P_SyncRoleInfoRet_SC;

    /**
     * Encodes the specified P_SyncRoleInfoRet_SC message. Does not implicitly {@link P_SyncRoleInfoRet_SC.verify|verify} messages.
     * @param message P_SyncRoleInfoRet_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncRoleInfoRet_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncRoleInfoRet_SC message, length delimited. Does not implicitly {@link P_SyncRoleInfoRet_SC.verify|verify} messages.
     * @param message P_SyncRoleInfoRet_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncRoleInfoRet_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncRoleInfoRet_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncRoleInfoRet_SC & P_SyncRoleInfoRet_SC.$Shape} P_SyncRoleInfoRet_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncRoleInfoRet_SC & P_SyncRoleInfoRet_SC.$Shape;

    /**
     * Decodes a P_SyncRoleInfoRet_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncRoleInfoRet_SC & P_SyncRoleInfoRet_SC.$Shape} P_SyncRoleInfoRet_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncRoleInfoRet_SC & P_SyncRoleInfoRet_SC.$Shape;

    /**
     * Verifies a P_SyncRoleInfoRet_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncRoleInfoRet_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncRoleInfoRet_SC
     */
    static fromObject(object: { [k: string]: any }): P_SyncRoleInfoRet_SC;

    /**
     * Creates a plain object from a P_SyncRoleInfoRet_SC message. Also converts values to other types if specified.
     * @param message P_SyncRoleInfoRet_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncRoleInfoRet_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncRoleInfoRet_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncRoleInfoRet_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncRoleInfoRet_SC {

    /** Properties of a P_SyncRoleInfoRet_SC. */
    interface $Properties {

        /** P_SyncRoleInfoRet_SC role_base_info */
        role_base_info?: (PB_RoleBaseInfo.$Properties|null);

        /** P_SyncRoleInfoRet_SC server_id */
        server_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncRoleInfoRet_SC. */
    type $Shape = P_SyncRoleInfoRet_SC.$Properties;
}

/**
 * Properties of a P_Chat_CS.
 * @deprecated Use P_Chat_CS.$Properties instead.
 */
export interface IP_Chat_CS extends P_Chat_CS.$Properties {
}

/** Represents a P_Chat_CS. */
export class P_Chat_CS {

    /**
     * Constructs a new P_Chat_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_Chat_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_Chat_CS req_type. */
    req_type?: (number|null);

    /** P_Chat_CS type. */
    type?: (number|null);

    /** P_Chat_CS chat_msg. */
    chat_msg?: (string|null);

    /** P_Chat_CS begin_id. */
    begin_id?: (number|null);

    /** P_Chat_CS get_count. */
    get_count?: (number|null);

    /**
     * Creates a new P_Chat_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_Chat_CS instance
     */
    static create(properties: P_Chat_CS.$Shape): P_Chat_CS & P_Chat_CS.$Shape;
    static create(properties?: P_Chat_CS.$Properties): P_Chat_CS;

    /**
     * Encodes the specified P_Chat_CS message. Does not implicitly {@link P_Chat_CS.verify|verify} messages.
     * @param message P_Chat_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_Chat_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_Chat_CS message, length delimited. Does not implicitly {@link P_Chat_CS.verify|verify} messages.
     * @param message P_Chat_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_Chat_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_Chat_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_Chat_CS & P_Chat_CS.$Shape} P_Chat_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_Chat_CS & P_Chat_CS.$Shape;

    /**
     * Decodes a P_Chat_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_Chat_CS & P_Chat_CS.$Shape} P_Chat_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_Chat_CS & P_Chat_CS.$Shape;

    /**
     * Verifies a P_Chat_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_Chat_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_Chat_CS
     */
    static fromObject(object: { [k: string]: any }): P_Chat_CS;

    /**
     * Creates a plain object from a P_Chat_CS message. Also converts values to other types if specified.
     * @param message P_Chat_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_Chat_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_Chat_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_Chat_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_Chat_CS {

    /** Properties of a P_Chat_CS. */
    interface $Properties {

        /** P_Chat_CS req_type */
        req_type?: (number|null);

        /** P_Chat_CS type */
        type?: (number|null);

        /** P_Chat_CS chat_msg */
        chat_msg?: (string|null);

        /** P_Chat_CS begin_id */
        begin_id?: (number|null);

        /** P_Chat_CS get_count */
        get_count?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_Chat_CS. */
    type $Shape = P_Chat_CS.$Properties;
}

/**
 * Properties of a P_Chat_SC.
 * @deprecated Use P_Chat_SC.$Properties instead.
 */
export interface IP_Chat_SC extends P_Chat_SC.$Properties {
}

/** Represents a P_Chat_SC. */
export class P_Chat_SC {

    /**
     * Constructs a new P_Chat_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_Chat_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_Chat_SC type. */
    type?: (number|null);

    /** P_Chat_SC begin_id. */
    begin_id?: (number|null);

    /** P_Chat_SC end_id. */
    end_id?: (number|null);

    /** P_Chat_SC chat_msgs. */
    chat_msgs: PB_ChatData.$Properties[];

    /**
     * Creates a new P_Chat_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_Chat_SC instance
     */
    static create(properties: P_Chat_SC.$Shape): P_Chat_SC & P_Chat_SC.$Shape;
    static create(properties?: P_Chat_SC.$Properties): P_Chat_SC;

    /**
     * Encodes the specified P_Chat_SC message. Does not implicitly {@link P_Chat_SC.verify|verify} messages.
     * @param message P_Chat_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_Chat_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_Chat_SC message, length delimited. Does not implicitly {@link P_Chat_SC.verify|verify} messages.
     * @param message P_Chat_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_Chat_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_Chat_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_Chat_SC & P_Chat_SC.$Shape} P_Chat_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_Chat_SC & P_Chat_SC.$Shape;

    /**
     * Decodes a P_Chat_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_Chat_SC & P_Chat_SC.$Shape} P_Chat_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_Chat_SC & P_Chat_SC.$Shape;

    /**
     * Verifies a P_Chat_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_Chat_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_Chat_SC
     */
    static fromObject(object: { [k: string]: any }): P_Chat_SC;

    /**
     * Creates a plain object from a P_Chat_SC message. Also converts values to other types if specified.
     * @param message P_Chat_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_Chat_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_Chat_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_Chat_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_Chat_SC {

    /** Properties of a P_Chat_SC. */
    interface $Properties {

        /** P_Chat_SC type */
        type?: (number|null);

        /** P_Chat_SC begin_id */
        begin_id?: (number|null);

        /** P_Chat_SC end_id */
        end_id?: (number|null);

        /** P_Chat_SC chat_msgs */
        chat_msgs?: (PB_ChatData.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_Chat_SC. */
    type $Shape = P_Chat_SC.$Properties;
}

/**
 * Properties of a P_GasBattle_CS.
 * @deprecated Use P_GasBattle_CS.$Properties instead.
 */
export interface IP_GasBattle_CS extends P_GasBattle_CS.$Properties {
}

/** Represents a P_GasBattle_CS. */
export class P_GasBattle_CS {

    /**
     * Constructs a new P_GasBattle_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_GasBattle_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_GasBattle_CS req_type. */
    req_type?: (number|null);

    /** P_GasBattle_CS battle_type. */
    battle_type?: (number|null);

    /** P_GasBattle_CS target_id. */
    target_id?: (number|null);

    /** P_GasBattle_CS report_key. */
    report_key?: (string|null);

    /**
     * Creates a new P_GasBattle_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_GasBattle_CS instance
     */
    static create(properties: P_GasBattle_CS.$Shape): P_GasBattle_CS & P_GasBattle_CS.$Shape;
    static create(properties?: P_GasBattle_CS.$Properties): P_GasBattle_CS;

    /**
     * Encodes the specified P_GasBattle_CS message. Does not implicitly {@link P_GasBattle_CS.verify|verify} messages.
     * @param message P_GasBattle_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_GasBattle_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_GasBattle_CS message, length delimited. Does not implicitly {@link P_GasBattle_CS.verify|verify} messages.
     * @param message P_GasBattle_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_GasBattle_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_GasBattle_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_GasBattle_CS & P_GasBattle_CS.$Shape} P_GasBattle_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_GasBattle_CS & P_GasBattle_CS.$Shape;

    /**
     * Decodes a P_GasBattle_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_GasBattle_CS & P_GasBattle_CS.$Shape} P_GasBattle_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_GasBattle_CS & P_GasBattle_CS.$Shape;

    /**
     * Verifies a P_GasBattle_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_GasBattle_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_GasBattle_CS
     */
    static fromObject(object: { [k: string]: any }): P_GasBattle_CS;

    /**
     * Creates a plain object from a P_GasBattle_CS message. Also converts values to other types if specified.
     * @param message P_GasBattle_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_GasBattle_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_GasBattle_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_GasBattle_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_GasBattle_CS {

    /** Properties of a P_GasBattle_CS. */
    interface $Properties {

        /** P_GasBattle_CS req_type */
        req_type?: (number|null);

        /** P_GasBattle_CS battle_type */
        battle_type?: (number|null);

        /** P_GasBattle_CS target_id */
        target_id?: (number|null);

        /** P_GasBattle_CS report_key */
        report_key?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_GasBattle_CS. */
    type $Shape = P_GasBattle_CS.$Properties;
}

/**
 * Properties of a P_GasBattle_SC.
 * @deprecated Use P_GasBattle_SC.$Properties instead.
 */
export interface IP_GasBattle_SC extends P_GasBattle_SC.$Properties {
}

/** Represents a P_GasBattle_SC. */
export class P_GasBattle_SC {

    /**
     * Constructs a new P_GasBattle_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_GasBattle_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_GasBattle_SC ret_type. */
    ret_type?: (number|null);

    /** P_GasBattle_SC battle_type. */
    battle_type?: (number|null);

    /** P_GasBattle_SC target_id. */
    target_id?: (number|null);

    /** P_GasBattle_SC total_matches. */
    total_matches?: (number|null);

    /** P_GasBattle_SC series_result. */
    series_result?: (number|null);

    /** P_GasBattle_SC win_matches. */
    win_matches?: (number|null);

    /** P_GasBattle_SC matches. */
    matches: PB_BattleMatchResult.$Properties[];

    /** P_GasBattle_SC score_change. */
    score_change?: (number|null);

    /** P_GasBattle_SC score_after. */
    score_after?: (number|null);

    /**
     * Creates a new P_GasBattle_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_GasBattle_SC instance
     */
    static create(properties: P_GasBattle_SC.$Shape): P_GasBattle_SC & P_GasBattle_SC.$Shape;
    static create(properties?: P_GasBattle_SC.$Properties): P_GasBattle_SC;

    /**
     * Encodes the specified P_GasBattle_SC message. Does not implicitly {@link P_GasBattle_SC.verify|verify} messages.
     * @param message P_GasBattle_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_GasBattle_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_GasBattle_SC message, length delimited. Does not implicitly {@link P_GasBattle_SC.verify|verify} messages.
     * @param message P_GasBattle_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_GasBattle_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_GasBattle_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_GasBattle_SC & P_GasBattle_SC.$Shape} P_GasBattle_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_GasBattle_SC & P_GasBattle_SC.$Shape;

    /**
     * Decodes a P_GasBattle_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_GasBattle_SC & P_GasBattle_SC.$Shape} P_GasBattle_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_GasBattle_SC & P_GasBattle_SC.$Shape;

    /**
     * Verifies a P_GasBattle_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_GasBattle_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_GasBattle_SC
     */
    static fromObject(object: { [k: string]: any }): P_GasBattle_SC;

    /**
     * Creates a plain object from a P_GasBattle_SC message. Also converts values to other types if specified.
     * @param message P_GasBattle_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_GasBattle_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_GasBattle_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_GasBattle_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_GasBattle_SC {

    /** Properties of a P_GasBattle_SC. */
    interface $Properties {

        /** P_GasBattle_SC ret_type */
        ret_type?: (number|null);

        /** P_GasBattle_SC battle_type */
        battle_type?: (number|null);

        /** P_GasBattle_SC target_id */
        target_id?: (number|null);

        /** P_GasBattle_SC total_matches */
        total_matches?: (number|null);

        /** P_GasBattle_SC series_result */
        series_result?: (number|null);

        /** P_GasBattle_SC win_matches */
        win_matches?: (number|null);

        /** P_GasBattle_SC matches */
        matches?: (PB_BattleMatchResult.$Properties[]|null);

        /** P_GasBattle_SC score_change */
        score_change?: (number|null);

        /** P_GasBattle_SC score_after */
        score_after?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_GasBattle_SC. */
    type $Shape = P_GasBattle_SC.$Properties;
}

/**
 * Properties of a P_SyncKnapsackData_SC.
 * @deprecated Use P_SyncKnapsackData_SC.$Properties instead.
 */
export interface IP_SyncKnapsackData_SC extends P_SyncKnapsackData_SC.$Properties {
}

/** Represents a P_SyncKnapsackData_SC. */
export class P_SyncKnapsackData_SC {

    /**
     * Constructs a new P_SyncKnapsackData_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncKnapsackData_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncKnapsackData_SC knapsack_data. */
    knapsack_data?: (PB_KnapsackData.$Properties|null);

    /**
     * Creates a new P_SyncKnapsackData_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncKnapsackData_SC instance
     */
    static create(properties: P_SyncKnapsackData_SC.$Shape): P_SyncKnapsackData_SC & P_SyncKnapsackData_SC.$Shape;
    static create(properties?: P_SyncKnapsackData_SC.$Properties): P_SyncKnapsackData_SC;

    /**
     * Encodes the specified P_SyncKnapsackData_SC message. Does not implicitly {@link P_SyncKnapsackData_SC.verify|verify} messages.
     * @param message P_SyncKnapsackData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncKnapsackData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncKnapsackData_SC message, length delimited. Does not implicitly {@link P_SyncKnapsackData_SC.verify|verify} messages.
     * @param message P_SyncKnapsackData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncKnapsackData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncKnapsackData_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncKnapsackData_SC & P_SyncKnapsackData_SC.$Shape} P_SyncKnapsackData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncKnapsackData_SC & P_SyncKnapsackData_SC.$Shape;

    /**
     * Decodes a P_SyncKnapsackData_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncKnapsackData_SC & P_SyncKnapsackData_SC.$Shape} P_SyncKnapsackData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncKnapsackData_SC & P_SyncKnapsackData_SC.$Shape;

    /**
     * Verifies a P_SyncKnapsackData_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncKnapsackData_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncKnapsackData_SC
     */
    static fromObject(object: { [k: string]: any }): P_SyncKnapsackData_SC;

    /**
     * Creates a plain object from a P_SyncKnapsackData_SC message. Also converts values to other types if specified.
     * @param message P_SyncKnapsackData_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncKnapsackData_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncKnapsackData_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncKnapsackData_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncKnapsackData_SC {

    /** Properties of a P_SyncKnapsackData_SC. */
    interface $Properties {

        /** P_SyncKnapsackData_SC knapsack_data */
        knapsack_data?: (PB_KnapsackData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncKnapsackData_SC. */
    type $Shape = P_SyncKnapsackData_SC.$Properties;
}

/**
 * Properties of a P_SyncRoleExtraData_SC.
 * @deprecated Use P_SyncRoleExtraData_SC.$Properties instead.
 */
export interface IP_SyncRoleExtraData_SC extends P_SyncRoleExtraData_SC.$Properties {
}

/** Represents a P_SyncRoleExtraData_SC. */
export class P_SyncRoleExtraData_SC {

    /**
     * Constructs a new P_SyncRoleExtraData_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncRoleExtraData_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /**
     * Creates a new P_SyncRoleExtraData_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncRoleExtraData_SC instance
     */
    static create(properties: P_SyncRoleExtraData_SC.$Shape): P_SyncRoleExtraData_SC & P_SyncRoleExtraData_SC.$Shape;
    static create(properties?: P_SyncRoleExtraData_SC.$Properties): P_SyncRoleExtraData_SC;

    /**
     * Encodes the specified P_SyncRoleExtraData_SC message. Does not implicitly {@link P_SyncRoleExtraData_SC.verify|verify} messages.
     * @param message P_SyncRoleExtraData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncRoleExtraData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncRoleExtraData_SC message, length delimited. Does not implicitly {@link P_SyncRoleExtraData_SC.verify|verify} messages.
     * @param message P_SyncRoleExtraData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncRoleExtraData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncRoleExtraData_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncRoleExtraData_SC & P_SyncRoleExtraData_SC.$Shape} P_SyncRoleExtraData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncRoleExtraData_SC & P_SyncRoleExtraData_SC.$Shape;

    /**
     * Decodes a P_SyncRoleExtraData_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncRoleExtraData_SC & P_SyncRoleExtraData_SC.$Shape} P_SyncRoleExtraData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncRoleExtraData_SC & P_SyncRoleExtraData_SC.$Shape;

    /**
     * Verifies a P_SyncRoleExtraData_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncRoleExtraData_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncRoleExtraData_SC
     */
    static fromObject(object: { [k: string]: any }): P_SyncRoleExtraData_SC;

    /**
     * Creates a plain object from a P_SyncRoleExtraData_SC message. Also converts values to other types if specified.
     * @param message P_SyncRoleExtraData_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncRoleExtraData_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncRoleExtraData_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncRoleExtraData_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncRoleExtraData_SC {

    /** Properties of a P_SyncRoleExtraData_SC. */
    interface $Properties {

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncRoleExtraData_SC. */
    type $Shape = P_SyncRoleExtraData_SC.$Properties;
}

/**
 * Properties of a P_SyncTaskData_SC.
 * @deprecated Use P_SyncTaskData_SC.$Properties instead.
 */
export interface IP_SyncTaskData_SC extends P_SyncTaskData_SC.$Properties {
}

/** Represents a P_SyncTaskData_SC. */
export class P_SyncTaskData_SC {

    /**
     * Constructs a new P_SyncTaskData_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncTaskData_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncTaskData_SC task_data. */
    task_data?: (PB_TaskData.$Properties|null);

    /**
     * Creates a new P_SyncTaskData_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncTaskData_SC instance
     */
    static create(properties: P_SyncTaskData_SC.$Shape): P_SyncTaskData_SC & P_SyncTaskData_SC.$Shape;
    static create(properties?: P_SyncTaskData_SC.$Properties): P_SyncTaskData_SC;

    /**
     * Encodes the specified P_SyncTaskData_SC message. Does not implicitly {@link P_SyncTaskData_SC.verify|verify} messages.
     * @param message P_SyncTaskData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncTaskData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncTaskData_SC message, length delimited. Does not implicitly {@link P_SyncTaskData_SC.verify|verify} messages.
     * @param message P_SyncTaskData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncTaskData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncTaskData_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncTaskData_SC & P_SyncTaskData_SC.$Shape} P_SyncTaskData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncTaskData_SC & P_SyncTaskData_SC.$Shape;

    /**
     * Decodes a P_SyncTaskData_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncTaskData_SC & P_SyncTaskData_SC.$Shape} P_SyncTaskData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncTaskData_SC & P_SyncTaskData_SC.$Shape;

    /**
     * Verifies a P_SyncTaskData_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncTaskData_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncTaskData_SC
     */
    static fromObject(object: { [k: string]: any }): P_SyncTaskData_SC;

    /**
     * Creates a plain object from a P_SyncTaskData_SC message. Also converts values to other types if specified.
     * @param message P_SyncTaskData_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncTaskData_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncTaskData_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncTaskData_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncTaskData_SC {

    /** Properties of a P_SyncTaskData_SC. */
    interface $Properties {

        /** P_SyncTaskData_SC task_data */
        task_data?: (PB_TaskData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncTaskData_SC. */
    type $Shape = P_SyncTaskData_SC.$Properties;
}

/**
 * Properties of a P_SyncHeroData_SC.
 * @deprecated Use P_SyncHeroData_SC.$Properties instead.
 */
export interface IP_SyncHeroData_SC extends P_SyncHeroData_SC.$Properties {
}

/** Represents a P_SyncHeroData_SC. */
export class P_SyncHeroData_SC {

    /**
     * Constructs a new P_SyncHeroData_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncHeroData_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncHeroData_SC hero_data. */
    hero_data?: (PB_HeroListData.$Properties|null);

    /**
     * Creates a new P_SyncHeroData_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncHeroData_SC instance
     */
    static create(properties: P_SyncHeroData_SC.$Shape): P_SyncHeroData_SC & P_SyncHeroData_SC.$Shape;
    static create(properties?: P_SyncHeroData_SC.$Properties): P_SyncHeroData_SC;

    /**
     * Encodes the specified P_SyncHeroData_SC message. Does not implicitly {@link P_SyncHeroData_SC.verify|verify} messages.
     * @param message P_SyncHeroData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncHeroData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncHeroData_SC message, length delimited. Does not implicitly {@link P_SyncHeroData_SC.verify|verify} messages.
     * @param message P_SyncHeroData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncHeroData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncHeroData_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncHeroData_SC & P_SyncHeroData_SC.$Shape} P_SyncHeroData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncHeroData_SC & P_SyncHeroData_SC.$Shape;

    /**
     * Decodes a P_SyncHeroData_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncHeroData_SC & P_SyncHeroData_SC.$Shape} P_SyncHeroData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncHeroData_SC & P_SyncHeroData_SC.$Shape;

    /**
     * Verifies a P_SyncHeroData_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncHeroData_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncHeroData_SC
     */
    static fromObject(object: { [k: string]: any }): P_SyncHeroData_SC;

    /**
     * Creates a plain object from a P_SyncHeroData_SC message. Also converts values to other types if specified.
     * @param message P_SyncHeroData_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncHeroData_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncHeroData_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncHeroData_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncHeroData_SC {

    /** Properties of a P_SyncHeroData_SC. */
    interface $Properties {

        /** P_SyncHeroData_SC hero_data */
        hero_data?: (PB_HeroListData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncHeroData_SC. */
    type $Shape = P_SyncHeroData_SC.$Properties;
}

/**
 * Properties of a P_SyncLineupData_SC.
 * @deprecated Use P_SyncLineupData_SC.$Properties instead.
 */
export interface IP_SyncLineupData_SC extends P_SyncLineupData_SC.$Properties {
}

/** Represents a P_SyncLineupData_SC. */
export class P_SyncLineupData_SC {

    /**
     * Constructs a new P_SyncLineupData_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncLineupData_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncLineupData_SC lineup_data. */
    lineup_data?: (PB_LineupListData.$Properties|null);

    /**
     * Creates a new P_SyncLineupData_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncLineupData_SC instance
     */
    static create(properties: P_SyncLineupData_SC.$Shape): P_SyncLineupData_SC & P_SyncLineupData_SC.$Shape;
    static create(properties?: P_SyncLineupData_SC.$Properties): P_SyncLineupData_SC;

    /**
     * Encodes the specified P_SyncLineupData_SC message. Does not implicitly {@link P_SyncLineupData_SC.verify|verify} messages.
     * @param message P_SyncLineupData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncLineupData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncLineupData_SC message, length delimited. Does not implicitly {@link P_SyncLineupData_SC.verify|verify} messages.
     * @param message P_SyncLineupData_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncLineupData_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncLineupData_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncLineupData_SC & P_SyncLineupData_SC.$Shape} P_SyncLineupData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncLineupData_SC & P_SyncLineupData_SC.$Shape;

    /**
     * Decodes a P_SyncLineupData_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncLineupData_SC & P_SyncLineupData_SC.$Shape} P_SyncLineupData_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncLineupData_SC & P_SyncLineupData_SC.$Shape;

    /**
     * Verifies a P_SyncLineupData_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncLineupData_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncLineupData_SC
     */
    static fromObject(object: { [k: string]: any }): P_SyncLineupData_SC;

    /**
     * Creates a plain object from a P_SyncLineupData_SC message. Also converts values to other types if specified.
     * @param message P_SyncLineupData_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncLineupData_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncLineupData_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncLineupData_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncLineupData_SC {

    /** Properties of a P_SyncLineupData_SC. */
    interface $Properties {

        /** P_SyncLineupData_SC lineup_data */
        lineup_data?: (PB_LineupListData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncLineupData_SC. */
    type $Shape = P_SyncLineupData_SC.$Properties;
}

/**
 * Properties of a P_SyncLineupUpdate_CS.
 * @deprecated Use P_SyncLineupUpdate_CS.$Properties instead.
 */
export interface IP_SyncLineupUpdate_CS extends P_SyncLineupUpdate_CS.$Properties {
}

/** Represents a P_SyncLineupUpdate_CS. */
export class P_SyncLineupUpdate_CS {

    /**
     * Constructs a new P_SyncLineupUpdate_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_SyncLineupUpdate_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_SyncLineupUpdate_CS battle_type. */
    battle_type?: (number|null);

    /** P_SyncLineupUpdate_CS hero_ids. */
    hero_ids: number[];

    /** P_SyncLineupUpdate_CS slot. */
    slot?: (number|null);

    /**
     * Creates a new P_SyncLineupUpdate_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_SyncLineupUpdate_CS instance
     */
    static create(properties: P_SyncLineupUpdate_CS.$Shape): P_SyncLineupUpdate_CS & P_SyncLineupUpdate_CS.$Shape;
    static create(properties?: P_SyncLineupUpdate_CS.$Properties): P_SyncLineupUpdate_CS;

    /**
     * Encodes the specified P_SyncLineupUpdate_CS message. Does not implicitly {@link P_SyncLineupUpdate_CS.verify|verify} messages.
     * @param message P_SyncLineupUpdate_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_SyncLineupUpdate_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_SyncLineupUpdate_CS message, length delimited. Does not implicitly {@link P_SyncLineupUpdate_CS.verify|verify} messages.
     * @param message P_SyncLineupUpdate_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_SyncLineupUpdate_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_SyncLineupUpdate_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_SyncLineupUpdate_CS & P_SyncLineupUpdate_CS.$Shape} P_SyncLineupUpdate_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_SyncLineupUpdate_CS & P_SyncLineupUpdate_CS.$Shape;

    /**
     * Decodes a P_SyncLineupUpdate_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_SyncLineupUpdate_CS & P_SyncLineupUpdate_CS.$Shape} P_SyncLineupUpdate_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_SyncLineupUpdate_CS & P_SyncLineupUpdate_CS.$Shape;

    /**
     * Verifies a P_SyncLineupUpdate_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_SyncLineupUpdate_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_SyncLineupUpdate_CS
     */
    static fromObject(object: { [k: string]: any }): P_SyncLineupUpdate_CS;

    /**
     * Creates a plain object from a P_SyncLineupUpdate_CS message. Also converts values to other types if specified.
     * @param message P_SyncLineupUpdate_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_SyncLineupUpdate_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_SyncLineupUpdate_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_SyncLineupUpdate_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_SyncLineupUpdate_CS {

    /** Properties of a P_SyncLineupUpdate_CS. */
    interface $Properties {

        /** P_SyncLineupUpdate_CS battle_type */
        battle_type?: (number|null);

        /** P_SyncLineupUpdate_CS hero_ids */
        hero_ids?: (number[]|null);

        /** P_SyncLineupUpdate_CS slot */
        slot?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_SyncLineupUpdate_CS. */
    type $Shape = P_SyncLineupUpdate_CS.$Properties;
}

/**
 * Properties of a P_Rank_CS.
 * @deprecated Use P_Rank_CS.$Properties instead.
 */
export interface IP_Rank_CS extends P_Rank_CS.$Properties {
}

/** Represents a P_Rank_CS. */
export class P_Rank_CS {

    /**
     * Constructs a new P_Rank_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_Rank_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_Rank_CS rank_type. */
    rank_type?: (number|null);

    /** P_Rank_CS rank_offset. */
    rank_offset?: (number|null);

    /**
     * Creates a new P_Rank_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_Rank_CS instance
     */
    static create(properties: P_Rank_CS.$Shape): P_Rank_CS & P_Rank_CS.$Shape;
    static create(properties?: P_Rank_CS.$Properties): P_Rank_CS;

    /**
     * Encodes the specified P_Rank_CS message. Does not implicitly {@link P_Rank_CS.verify|verify} messages.
     * @param message P_Rank_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_Rank_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_Rank_CS message, length delimited. Does not implicitly {@link P_Rank_CS.verify|verify} messages.
     * @param message P_Rank_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_Rank_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_Rank_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_Rank_CS & P_Rank_CS.$Shape} P_Rank_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_Rank_CS & P_Rank_CS.$Shape;

    /**
     * Decodes a P_Rank_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_Rank_CS & P_Rank_CS.$Shape} P_Rank_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_Rank_CS & P_Rank_CS.$Shape;

    /**
     * Verifies a P_Rank_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_Rank_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_Rank_CS
     */
    static fromObject(object: { [k: string]: any }): P_Rank_CS;

    /**
     * Creates a plain object from a P_Rank_CS message. Also converts values to other types if specified.
     * @param message P_Rank_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_Rank_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_Rank_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_Rank_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_Rank_CS {

    /** Properties of a P_Rank_CS. */
    interface $Properties {

        /** P_Rank_CS rank_type */
        rank_type?: (number|null);

        /** P_Rank_CS rank_offset */
        rank_offset?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_Rank_CS. */
    type $Shape = P_Rank_CS.$Properties;
}

/**
 * Properties of a P_Rank_SC.
 * @deprecated Use P_Rank_SC.$Properties instead.
 */
export interface IP_Rank_SC extends P_Rank_SC.$Properties {
}

/** Represents a P_Rank_SC. */
export class P_Rank_SC {

    /**
     * Constructs a new P_Rank_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_Rank_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_Rank_SC rank_type. */
    rank_type?: (number|null);

    /** P_Rank_SC ret. */
    ret?: (number|null);

    /** P_Rank_SC rank_list. */
    rank_list: PB_RankNode.$Properties[];

    /** P_Rank_SC has_more. */
    has_more?: (boolean|null);

    /** P_Rank_SC total. */
    total?: (number|null);

    /**
     * Creates a new P_Rank_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_Rank_SC instance
     */
    static create(properties: P_Rank_SC.$Shape): P_Rank_SC & P_Rank_SC.$Shape;
    static create(properties?: P_Rank_SC.$Properties): P_Rank_SC;

    /**
     * Encodes the specified P_Rank_SC message. Does not implicitly {@link P_Rank_SC.verify|verify} messages.
     * @param message P_Rank_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_Rank_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_Rank_SC message, length delimited. Does not implicitly {@link P_Rank_SC.verify|verify} messages.
     * @param message P_Rank_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_Rank_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_Rank_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_Rank_SC & P_Rank_SC.$Shape} P_Rank_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_Rank_SC & P_Rank_SC.$Shape;

    /**
     * Decodes a P_Rank_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_Rank_SC & P_Rank_SC.$Shape} P_Rank_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_Rank_SC & P_Rank_SC.$Shape;

    /**
     * Verifies a P_Rank_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_Rank_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_Rank_SC
     */
    static fromObject(object: { [k: string]: any }): P_Rank_SC;

    /**
     * Creates a plain object from a P_Rank_SC message. Also converts values to other types if specified.
     * @param message P_Rank_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_Rank_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_Rank_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_Rank_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_Rank_SC {

    /** Properties of a P_Rank_SC. */
    interface $Properties {

        /** P_Rank_SC rank_type */
        rank_type?: (number|null);

        /** P_Rank_SC ret */
        ret?: (number|null);

        /** P_Rank_SC rank_list */
        rank_list?: (PB_RankNode.$Properties[]|null);

        /** P_Rank_SC has_more */
        has_more?: (boolean|null);

        /** P_Rank_SC total */
        total?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_Rank_SC. */
    type $Shape = P_Rank_SC.$Properties;
}

/**
 * Properties of a PB_ArenaOpponentInfo.
 * @deprecated Use PB_ArenaOpponentInfo.$Properties instead.
 */
export interface IPB_ArenaOpponentInfo extends PB_ArenaOpponentInfo.$Properties {
}

/** Represents a PB_ArenaOpponentInfo. */
export class PB_ArenaOpponentInfo {

    /**
     * Constructs a new PB_ArenaOpponentInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ArenaOpponentInfo.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ArenaOpponentInfo uid. */
    uid?: (number|null);

    /** PB_ArenaOpponentInfo name. */
    name?: (string|null);

    /** PB_ArenaOpponentInfo user_name. */
    user_name?: (string|null);

    /** PB_ArenaOpponentInfo score. */
    score?: (number|null);

    /** PB_ArenaOpponentInfo heroes. */
    heroes: PB_HeroData.$Properties[];

    /**
     * Creates a new PB_ArenaOpponentInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ArenaOpponentInfo instance
     */
    static create(properties: PB_ArenaOpponentInfo.$Shape): PB_ArenaOpponentInfo & PB_ArenaOpponentInfo.$Shape;
    static create(properties?: PB_ArenaOpponentInfo.$Properties): PB_ArenaOpponentInfo;

    /**
     * Encodes the specified PB_ArenaOpponentInfo message. Does not implicitly {@link PB_ArenaOpponentInfo.verify|verify} messages.
     * @param message PB_ArenaOpponentInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ArenaOpponentInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ArenaOpponentInfo message, length delimited. Does not implicitly {@link PB_ArenaOpponentInfo.verify|verify} messages.
     * @param message PB_ArenaOpponentInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ArenaOpponentInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ArenaOpponentInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ArenaOpponentInfo & PB_ArenaOpponentInfo.$Shape} PB_ArenaOpponentInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ArenaOpponentInfo & PB_ArenaOpponentInfo.$Shape;

    /**
     * Decodes a PB_ArenaOpponentInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ArenaOpponentInfo & PB_ArenaOpponentInfo.$Shape} PB_ArenaOpponentInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ArenaOpponentInfo & PB_ArenaOpponentInfo.$Shape;

    /**
     * Verifies a PB_ArenaOpponentInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ArenaOpponentInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ArenaOpponentInfo
     */
    static fromObject(object: { [k: string]: any }): PB_ArenaOpponentInfo;

    /**
     * Creates a plain object from a PB_ArenaOpponentInfo message. Also converts values to other types if specified.
     * @param message PB_ArenaOpponentInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ArenaOpponentInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ArenaOpponentInfo to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ArenaOpponentInfo
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ArenaOpponentInfo {

    /** Properties of a PB_ArenaOpponentInfo. */
    interface $Properties {

        /** PB_ArenaOpponentInfo uid */
        uid?: (number|null);

        /** PB_ArenaOpponentInfo name */
        name?: (string|null);

        /** PB_ArenaOpponentInfo user_name */
        user_name?: (string|null);

        /** PB_ArenaOpponentInfo score */
        score?: (number|null);

        /** PB_ArenaOpponentInfo heroes */
        heroes?: (PB_HeroData.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ArenaOpponentInfo. */
    type $Shape = PB_ArenaOpponentInfo.$Properties;
}

/**
 * Properties of a PB_ArenaBattleLog.
 * @deprecated Use PB_ArenaBattleLog.$Properties instead.
 */
export interface IPB_ArenaBattleLog extends PB_ArenaBattleLog.$Properties {
}

/** Represents a PB_ArenaBattleLog. */
export class PB_ArenaBattleLog {

    /**
     * Constructs a new PB_ArenaBattleLog.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ArenaBattleLog.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ArenaBattleLog time. */
    time?: (number|null);

    /** PB_ArenaBattleLog report_key. */
    report_key?: (string|null);

    /** PB_ArenaBattleLog my_heroes. */
    my_heroes: PB_HeroData.$Properties[];

    /** PB_ArenaBattleLog opponent_uid. */
    opponent_uid?: (number|null);

    /** PB_ArenaBattleLog opponent_name. */
    opponent_name?: (string|null);

    /** PB_ArenaBattleLog opponent_heroes. */
    opponent_heroes: PB_HeroData.$Properties[];

    /** PB_ArenaBattleLog is_win. */
    is_win?: (boolean|null);

    /** PB_ArenaBattleLog score_change. */
    score_change?: (number|null);

    /** PB_ArenaBattleLog score_after. */
    score_after?: (number|null);

    /**
     * Creates a new PB_ArenaBattleLog instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ArenaBattleLog instance
     */
    static create(properties: PB_ArenaBattleLog.$Shape): PB_ArenaBattleLog & PB_ArenaBattleLog.$Shape;
    static create(properties?: PB_ArenaBattleLog.$Properties): PB_ArenaBattleLog;

    /**
     * Encodes the specified PB_ArenaBattleLog message. Does not implicitly {@link PB_ArenaBattleLog.verify|verify} messages.
     * @param message PB_ArenaBattleLog message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ArenaBattleLog.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ArenaBattleLog message, length delimited. Does not implicitly {@link PB_ArenaBattleLog.verify|verify} messages.
     * @param message PB_ArenaBattleLog message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ArenaBattleLog.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ArenaBattleLog message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ArenaBattleLog & PB_ArenaBattleLog.$Shape} PB_ArenaBattleLog
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ArenaBattleLog & PB_ArenaBattleLog.$Shape;

    /**
     * Decodes a PB_ArenaBattleLog message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ArenaBattleLog & PB_ArenaBattleLog.$Shape} PB_ArenaBattleLog
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ArenaBattleLog & PB_ArenaBattleLog.$Shape;

    /**
     * Verifies a PB_ArenaBattleLog message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ArenaBattleLog message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ArenaBattleLog
     */
    static fromObject(object: { [k: string]: any }): PB_ArenaBattleLog;

    /**
     * Creates a plain object from a PB_ArenaBattleLog message. Also converts values to other types if specified.
     * @param message PB_ArenaBattleLog
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ArenaBattleLog, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ArenaBattleLog to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ArenaBattleLog
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ArenaBattleLog {

    /** Properties of a PB_ArenaBattleLog. */
    interface $Properties {

        /** PB_ArenaBattleLog time */
        time?: (number|null);

        /** PB_ArenaBattleLog report_key */
        report_key?: (string|null);

        /** PB_ArenaBattleLog my_heroes */
        my_heroes?: (PB_HeroData.$Properties[]|null);

        /** PB_ArenaBattleLog opponent_uid */
        opponent_uid?: (number|null);

        /** PB_ArenaBattleLog opponent_name */
        opponent_name?: (string|null);

        /** PB_ArenaBattleLog opponent_heroes */
        opponent_heroes?: (PB_HeroData.$Properties[]|null);

        /** PB_ArenaBattleLog is_win */
        is_win?: (boolean|null);

        /** PB_ArenaBattleLog score_change */
        score_change?: (number|null);

        /** PB_ArenaBattleLog score_after */
        score_after?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ArenaBattleLog. */
    type $Shape = PB_ArenaBattleLog.$Properties;
}

/**
 * Properties of a P_Arena_CS.
 * @deprecated Use P_Arena_CS.$Properties instead.
 */
export interface IP_Arena_CS extends P_Arena_CS.$Properties {
}

/** Represents a P_Arena_CS. */
export class P_Arena_CS {

    /**
     * Constructs a new P_Arena_CS.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_Arena_CS.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_Arena_CS req_type. */
    req_type?: (number|null);

    /**
     * Creates a new P_Arena_CS instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_Arena_CS instance
     */
    static create(properties: P_Arena_CS.$Shape): P_Arena_CS & P_Arena_CS.$Shape;
    static create(properties?: P_Arena_CS.$Properties): P_Arena_CS;

    /**
     * Encodes the specified P_Arena_CS message. Does not implicitly {@link P_Arena_CS.verify|verify} messages.
     * @param message P_Arena_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_Arena_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_Arena_CS message, length delimited. Does not implicitly {@link P_Arena_CS.verify|verify} messages.
     * @param message P_Arena_CS message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_Arena_CS.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_Arena_CS message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_Arena_CS & P_Arena_CS.$Shape} P_Arena_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_Arena_CS & P_Arena_CS.$Shape;

    /**
     * Decodes a P_Arena_CS message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_Arena_CS & P_Arena_CS.$Shape} P_Arena_CS
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_Arena_CS & P_Arena_CS.$Shape;

    /**
     * Verifies a P_Arena_CS message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_Arena_CS message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_Arena_CS
     */
    static fromObject(object: { [k: string]: any }): P_Arena_CS;

    /**
     * Creates a plain object from a P_Arena_CS message. Also converts values to other types if specified.
     * @param message P_Arena_CS
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_Arena_CS, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_Arena_CS to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_Arena_CS
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_Arena_CS {

    /** Properties of a P_Arena_CS. */
    interface $Properties {

        /** P_Arena_CS req_type */
        req_type?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_Arena_CS. */
    type $Shape = P_Arena_CS.$Properties;
}

/**
 * Properties of a P_Arena_SC.
 * @deprecated Use P_Arena_SC.$Properties instead.
 */
export interface IP_Arena_SC extends P_Arena_SC.$Properties {
}

/** Represents a P_Arena_SC. */
export class P_Arena_SC {

    /**
     * Constructs a new P_Arena_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_Arena_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_Arena_SC req_type. */
    req_type?: (number|null);

    /** P_Arena_SC ret. */
    ret?: (number|null);

    /** P_Arena_SC score. */
    score?: (number|null);

    /** P_Arena_SC daily_challenge_count. */
    daily_challenge_count?: (number|null);

    /** P_Arena_SC daily_refresh_count. */
    daily_refresh_count?: (number|null);

    /** P_Arena_SC opponents. */
    opponents: PB_ArenaOpponentInfo.$Properties[];

    /**
     * Creates a new P_Arena_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_Arena_SC instance
     */
    static create(properties: P_Arena_SC.$Shape): P_Arena_SC & P_Arena_SC.$Shape;
    static create(properties?: P_Arena_SC.$Properties): P_Arena_SC;

    /**
     * Encodes the specified P_Arena_SC message. Does not implicitly {@link P_Arena_SC.verify|verify} messages.
     * @param message P_Arena_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_Arena_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_Arena_SC message, length delimited. Does not implicitly {@link P_Arena_SC.verify|verify} messages.
     * @param message P_Arena_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_Arena_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_Arena_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_Arena_SC & P_Arena_SC.$Shape} P_Arena_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_Arena_SC & P_Arena_SC.$Shape;

    /**
     * Decodes a P_Arena_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_Arena_SC & P_Arena_SC.$Shape} P_Arena_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_Arena_SC & P_Arena_SC.$Shape;

    /**
     * Verifies a P_Arena_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_Arena_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_Arena_SC
     */
    static fromObject(object: { [k: string]: any }): P_Arena_SC;

    /**
     * Creates a plain object from a P_Arena_SC message. Also converts values to other types if specified.
     * @param message P_Arena_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_Arena_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_Arena_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_Arena_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_Arena_SC {

    /** Properties of a P_Arena_SC. */
    interface $Properties {

        /** P_Arena_SC req_type */
        req_type?: (number|null);

        /** P_Arena_SC ret */
        ret?: (number|null);

        /** P_Arena_SC score */
        score?: (number|null);

        /** P_Arena_SC daily_challenge_count */
        daily_challenge_count?: (number|null);

        /** P_Arena_SC daily_refresh_count */
        daily_refresh_count?: (number|null);

        /** P_Arena_SC opponents */
        opponents?: (PB_ArenaOpponentInfo.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_Arena_SC. */
    type $Shape = P_Arena_SC.$Properties;
}

/**
 * Properties of a P_ArenaBattleLog_SC.
 * @deprecated Use P_ArenaBattleLog_SC.$Properties instead.
 */
export interface IP_ArenaBattleLog_SC extends P_ArenaBattleLog_SC.$Properties {
}

/** Represents a P_ArenaBattleLog_SC. */
export class P_ArenaBattleLog_SC {

    /**
     * Constructs a new P_ArenaBattleLog_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ArenaBattleLog_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ArenaBattleLog_SC ret. */
    ret?: (number|null);

    /** P_ArenaBattleLog_SC battle_logs. */
    battle_logs: PB_ArenaBattleLog.$Properties[];

    /**
     * Creates a new P_ArenaBattleLog_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ArenaBattleLog_SC instance
     */
    static create(properties: P_ArenaBattleLog_SC.$Shape): P_ArenaBattleLog_SC & P_ArenaBattleLog_SC.$Shape;
    static create(properties?: P_ArenaBattleLog_SC.$Properties): P_ArenaBattleLog_SC;

    /**
     * Encodes the specified P_ArenaBattleLog_SC message. Does not implicitly {@link P_ArenaBattleLog_SC.verify|verify} messages.
     * @param message P_ArenaBattleLog_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ArenaBattleLog_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ArenaBattleLog_SC message, length delimited. Does not implicitly {@link P_ArenaBattleLog_SC.verify|verify} messages.
     * @param message P_ArenaBattleLog_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ArenaBattleLog_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ArenaBattleLog_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ArenaBattleLog_SC & P_ArenaBattleLog_SC.$Shape} P_ArenaBattleLog_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ArenaBattleLog_SC & P_ArenaBattleLog_SC.$Shape;

    /**
     * Decodes a P_ArenaBattleLog_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ArenaBattleLog_SC & P_ArenaBattleLog_SC.$Shape} P_ArenaBattleLog_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ArenaBattleLog_SC & P_ArenaBattleLog_SC.$Shape;

    /**
     * Verifies a P_ArenaBattleLog_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ArenaBattleLog_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ArenaBattleLog_SC
     */
    static fromObject(object: { [k: string]: any }): P_ArenaBattleLog_SC;

    /**
     * Creates a plain object from a P_ArenaBattleLog_SC message. Also converts values to other types if specified.
     * @param message P_ArenaBattleLog_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ArenaBattleLog_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ArenaBattleLog_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ArenaBattleLog_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ArenaBattleLog_SC {

    /** Properties of a P_ArenaBattleLog_SC. */
    interface $Properties {

        /** P_ArenaBattleLog_SC ret */
        ret?: (number|null);

        /** P_ArenaBattleLog_SC battle_logs */
        battle_logs?: (PB_ArenaBattleLog.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ArenaBattleLog_SC. */
    type $Shape = P_ArenaBattleLog_SC.$Properties;
}

/**
 * Properties of a P_ArenaRank_SC.
 * @deprecated Use P_ArenaRank_SC.$Properties instead.
 */
export interface IP_ArenaRank_SC extends P_ArenaRank_SC.$Properties {
}

/** Represents a P_ArenaRank_SC. */
export class P_ArenaRank_SC {

    /**
     * Constructs a new P_ArenaRank_SC.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ArenaRank_SC.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ArenaRank_SC ret. */
    ret?: (number|null);

    /** P_ArenaRank_SC rank_list. */
    rank_list: PB_ArenaRankNode.$Properties[];

    /** P_ArenaRank_SC has_more. */
    has_more?: (boolean|null);

    /** P_ArenaRank_SC total. */
    total?: (number|null);

    /**
     * Creates a new P_ArenaRank_SC instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ArenaRank_SC instance
     */
    static create(properties: P_ArenaRank_SC.$Shape): P_ArenaRank_SC & P_ArenaRank_SC.$Shape;
    static create(properties?: P_ArenaRank_SC.$Properties): P_ArenaRank_SC;

    /**
     * Encodes the specified P_ArenaRank_SC message. Does not implicitly {@link P_ArenaRank_SC.verify|verify} messages.
     * @param message P_ArenaRank_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ArenaRank_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ArenaRank_SC message, length delimited. Does not implicitly {@link P_ArenaRank_SC.verify|verify} messages.
     * @param message P_ArenaRank_SC message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ArenaRank_SC.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ArenaRank_SC message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ArenaRank_SC & P_ArenaRank_SC.$Shape} P_ArenaRank_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ArenaRank_SC & P_ArenaRank_SC.$Shape;

    /**
     * Decodes a P_ArenaRank_SC message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ArenaRank_SC & P_ArenaRank_SC.$Shape} P_ArenaRank_SC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ArenaRank_SC & P_ArenaRank_SC.$Shape;

    /**
     * Verifies a P_ArenaRank_SC message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ArenaRank_SC message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ArenaRank_SC
     */
    static fromObject(object: { [k: string]: any }): P_ArenaRank_SC;

    /**
     * Creates a plain object from a P_ArenaRank_SC message. Also converts values to other types if specified.
     * @param message P_ArenaRank_SC
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ArenaRank_SC, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ArenaRank_SC to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ArenaRank_SC
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ArenaRank_SC {

    /** Properties of a P_ArenaRank_SC. */
    interface $Properties {

        /** P_ArenaRank_SC ret */
        ret?: (number|null);

        /** P_ArenaRank_SC rank_list */
        rank_list?: (PB_ArenaRankNode.$Properties[]|null);

        /** P_ArenaRank_SC has_more */
        has_more?: (boolean|null);

        /** P_ArenaRank_SC total */
        total?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ArenaRank_SC. */
    type $Shape = P_ArenaRank_SC.$Properties;
}

/**
 * Properties of a PB_RoleBaseInfo.
 * @deprecated Use PB_RoleBaseInfo.$Properties instead.
 */
export interface IPB_RoleBaseInfo extends PB_RoleBaseInfo.$Properties {
}

/** Represents a PB_RoleBaseInfo. */
export class PB_RoleBaseInfo {

    /**
     * Constructs a new PB_RoleBaseInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_RoleBaseInfo.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_RoleBaseInfo uid. */
    uid?: (number|null);

    /** PB_RoleBaseInfo name. */
    name?: (string|null);

    /** PB_RoleBaseInfo user_name. */
    user_name?: (string|null);

    /** PB_RoleBaseInfo level. */
    level?: (number|null);

    /** PB_RoleBaseInfo exp. */
    exp?: (number|null);

    /** PB_RoleBaseInfo last_login_time. */
    last_login_time?: (number|null);

    /** PB_RoleBaseInfo knapsack_max_slots. */
    knapsack_max_slots?: (number|null);

    /** PB_RoleBaseInfo create_time. */
    create_time?: (number|null);

    /** PB_RoleBaseInfo hero_id. */
    hero_id?: (number|null);

    /**
     * Creates a new PB_RoleBaseInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_RoleBaseInfo instance
     */
    static create(properties: PB_RoleBaseInfo.$Shape): PB_RoleBaseInfo & PB_RoleBaseInfo.$Shape;
    static create(properties?: PB_RoleBaseInfo.$Properties): PB_RoleBaseInfo;

    /**
     * Encodes the specified PB_RoleBaseInfo message. Does not implicitly {@link PB_RoleBaseInfo.verify|verify} messages.
     * @param message PB_RoleBaseInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_RoleBaseInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_RoleBaseInfo message, length delimited. Does not implicitly {@link PB_RoleBaseInfo.verify|verify} messages.
     * @param message PB_RoleBaseInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_RoleBaseInfo.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_RoleBaseInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_RoleBaseInfo & PB_RoleBaseInfo.$Shape} PB_RoleBaseInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_RoleBaseInfo & PB_RoleBaseInfo.$Shape;

    /**
     * Decodes a PB_RoleBaseInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_RoleBaseInfo & PB_RoleBaseInfo.$Shape} PB_RoleBaseInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_RoleBaseInfo & PB_RoleBaseInfo.$Shape;

    /**
     * Verifies a PB_RoleBaseInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_RoleBaseInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_RoleBaseInfo
     */
    static fromObject(object: { [k: string]: any }): PB_RoleBaseInfo;

    /**
     * Creates a plain object from a PB_RoleBaseInfo message. Also converts values to other types if specified.
     * @param message PB_RoleBaseInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_RoleBaseInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_RoleBaseInfo to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_RoleBaseInfo
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_RoleBaseInfo {

    /** Properties of a PB_RoleBaseInfo. */
    interface $Properties {

        /** PB_RoleBaseInfo uid */
        uid?: (number|null);

        /** PB_RoleBaseInfo name */
        name?: (string|null);

        /** PB_RoleBaseInfo user_name */
        user_name?: (string|null);

        /** PB_RoleBaseInfo level */
        level?: (number|null);

        /** PB_RoleBaseInfo exp */
        exp?: (number|null);

        /** PB_RoleBaseInfo last_login_time */
        last_login_time?: (number|null);

        /** PB_RoleBaseInfo knapsack_max_slots */
        knapsack_max_slots?: (number|null);

        /** PB_RoleBaseInfo create_time */
        create_time?: (number|null);

        /** PB_RoleBaseInfo hero_id */
        hero_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_RoleBaseInfo. */
    type $Shape = PB_RoleBaseInfo.$Properties;
}

/**
 * Properties of a PB_ActivityRoleNode.
 * @deprecated Use PB_ActivityRoleNode.$Properties instead.
 */
export interface IPB_ActivityRoleNode extends PB_ActivityRoleNode.$Properties {
}

/** Represents a PB_ActivityRoleNode. */
export class PB_ActivityRoleNode {

    /**
     * Constructs a new PB_ActivityRoleNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ActivityRoleNode.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ActivityRoleNode activity_id. */
    activity_id?: (number|null);

    /** PB_ActivityRoleNode round. */
    round?: (number|null);

    /** PB_ActivityRoleNode count. */
    count?: (number|null);

    /** PB_ActivityRoleNode score. */
    score?: (number|null);

    /** PB_ActivityRoleNode last_time. */
    last_time?: (number|null);

    /** PB_ActivityRoleNode rewarded. */
    rewarded?: (boolean|null);

    /** PB_ActivityRoleNode extra. */
    extra?: (string|null);

    /**
     * Creates a new PB_ActivityRoleNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ActivityRoleNode instance
     */
    static create(properties: PB_ActivityRoleNode.$Shape): PB_ActivityRoleNode & PB_ActivityRoleNode.$Shape;
    static create(properties?: PB_ActivityRoleNode.$Properties): PB_ActivityRoleNode;

    /**
     * Encodes the specified PB_ActivityRoleNode message. Does not implicitly {@link PB_ActivityRoleNode.verify|verify} messages.
     * @param message PB_ActivityRoleNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ActivityRoleNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ActivityRoleNode message, length delimited. Does not implicitly {@link PB_ActivityRoleNode.verify|verify} messages.
     * @param message PB_ActivityRoleNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ActivityRoleNode.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ActivityRoleNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ActivityRoleNode & PB_ActivityRoleNode.$Shape} PB_ActivityRoleNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ActivityRoleNode & PB_ActivityRoleNode.$Shape;

    /**
     * Decodes a PB_ActivityRoleNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ActivityRoleNode & PB_ActivityRoleNode.$Shape} PB_ActivityRoleNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ActivityRoleNode & PB_ActivityRoleNode.$Shape;

    /**
     * Verifies a PB_ActivityRoleNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ActivityRoleNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ActivityRoleNode
     */
    static fromObject(object: { [k: string]: any }): PB_ActivityRoleNode;

    /**
     * Creates a plain object from a PB_ActivityRoleNode message. Also converts values to other types if specified.
     * @param message PB_ActivityRoleNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ActivityRoleNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ActivityRoleNode to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ActivityRoleNode
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ActivityRoleNode {

    /** Properties of a PB_ActivityRoleNode. */
    interface $Properties {

        /** PB_ActivityRoleNode activity_id */
        activity_id?: (number|null);

        /** PB_ActivityRoleNode round */
        round?: (number|null);

        /** PB_ActivityRoleNode count */
        count?: (number|null);

        /** PB_ActivityRoleNode score */
        score?: (number|null);

        /** PB_ActivityRoleNode last_time */
        last_time?: (number|null);

        /** PB_ActivityRoleNode rewarded */
        rewarded?: (boolean|null);

        /** PB_ActivityRoleNode extra */
        extra?: (string|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ActivityRoleNode. */
    type $Shape = PB_ActivityRoleNode.$Properties;
}

/**
 * Properties of a PB_ActivityRoleData.
 * @deprecated Use PB_ActivityRoleData.$Properties instead.
 */
export interface IPB_ActivityRoleData extends PB_ActivityRoleData.$Properties {
}

/** Represents a PB_ActivityRoleData. */
export class PB_ActivityRoleData {

    /**
     * Constructs a new PB_ActivityRoleData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_ActivityRoleData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_ActivityRoleData nodes. */
    nodes: PB_ActivityRoleNode.$Properties[];

    /**
     * Creates a new PB_ActivityRoleData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_ActivityRoleData instance
     */
    static create(properties: PB_ActivityRoleData.$Shape): PB_ActivityRoleData & PB_ActivityRoleData.$Shape;
    static create(properties?: PB_ActivityRoleData.$Properties): PB_ActivityRoleData;

    /**
     * Encodes the specified PB_ActivityRoleData message. Does not implicitly {@link PB_ActivityRoleData.verify|verify} messages.
     * @param message PB_ActivityRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_ActivityRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_ActivityRoleData message, length delimited. Does not implicitly {@link PB_ActivityRoleData.verify|verify} messages.
     * @param message PB_ActivityRoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_ActivityRoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_ActivityRoleData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_ActivityRoleData & PB_ActivityRoleData.$Shape} PB_ActivityRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_ActivityRoleData & PB_ActivityRoleData.$Shape;

    /**
     * Decodes a PB_ActivityRoleData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_ActivityRoleData & PB_ActivityRoleData.$Shape} PB_ActivityRoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_ActivityRoleData & PB_ActivityRoleData.$Shape;

    /**
     * Verifies a PB_ActivityRoleData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_ActivityRoleData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_ActivityRoleData
     */
    static fromObject(object: { [k: string]: any }): PB_ActivityRoleData;

    /**
     * Creates a plain object from a PB_ActivityRoleData message. Also converts values to other types if specified.
     * @param message PB_ActivityRoleData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_ActivityRoleData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_ActivityRoleData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_ActivityRoleData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_ActivityRoleData {

    /** Properties of a PB_ActivityRoleData. */
    interface $Properties {

        /** PB_ActivityRoleData nodes */
        nodes?: (PB_ActivityRoleNode.$Properties[]|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_ActivityRoleData. */
    type $Shape = PB_ActivityRoleData.$Properties;
}

/**
 * Properties of a PB_RoleGrowthData.
 * @deprecated Use PB_RoleGrowthData.$Properties instead.
 */
export interface IPB_RoleGrowthData extends PB_RoleGrowthData.$Properties {
}

/** Represents a PB_RoleGrowthData. */
export class PB_RoleGrowthData {

    /**
     * Constructs a new PB_RoleGrowthData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_RoleGrowthData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_RoleGrowthData hero. */
    hero?: (PB_HeroListData.$Properties|null);

    /** PB_RoleGrowthData lineup. */
    lineup?: (PB_LineupListData.$Properties|null);

    /** PB_RoleGrowthData task. */
    task?: (PB_TaskData.$Properties|null);

    /** PB_RoleGrowthData activity. */
    activity?: (PB_ActivityRoleData.$Properties|null);

    /**
     * Creates a new PB_RoleGrowthData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_RoleGrowthData instance
     */
    static create(properties: PB_RoleGrowthData.$Shape): PB_RoleGrowthData & PB_RoleGrowthData.$Shape;
    static create(properties?: PB_RoleGrowthData.$Properties): PB_RoleGrowthData;

    /**
     * Encodes the specified PB_RoleGrowthData message. Does not implicitly {@link PB_RoleGrowthData.verify|verify} messages.
     * @param message PB_RoleGrowthData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_RoleGrowthData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_RoleGrowthData message, length delimited. Does not implicitly {@link PB_RoleGrowthData.verify|verify} messages.
     * @param message PB_RoleGrowthData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_RoleGrowthData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_RoleGrowthData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_RoleGrowthData & PB_RoleGrowthData.$Shape} PB_RoleGrowthData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_RoleGrowthData & PB_RoleGrowthData.$Shape;

    /**
     * Decodes a PB_RoleGrowthData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_RoleGrowthData & PB_RoleGrowthData.$Shape} PB_RoleGrowthData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_RoleGrowthData & PB_RoleGrowthData.$Shape;

    /**
     * Verifies a PB_RoleGrowthData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_RoleGrowthData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_RoleGrowthData
     */
    static fromObject(object: { [k: string]: any }): PB_RoleGrowthData;

    /**
     * Creates a plain object from a PB_RoleGrowthData message. Also converts values to other types if specified.
     * @param message PB_RoleGrowthData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_RoleGrowthData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_RoleGrowthData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_RoleGrowthData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_RoleGrowthData {

    /** Properties of a PB_RoleGrowthData. */
    interface $Properties {

        /** PB_RoleGrowthData hero */
        hero?: (PB_HeroListData.$Properties|null);

        /** PB_RoleGrowthData lineup */
        lineup?: (PB_LineupListData.$Properties|null);

        /** PB_RoleGrowthData task */
        task?: (PB_TaskData.$Properties|null);

        /** PB_RoleGrowthData activity */
        activity?: (PB_ActivityRoleData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_RoleGrowthData. */
    type $Shape = PB_RoleGrowthData.$Properties;
}

/**
 * Properties of a PB_RoleBattleSnapshot.
 * @deprecated Use PB_RoleBattleSnapshot.$Properties instead.
 */
export interface IPB_RoleBattleSnapshot extends PB_RoleBattleSnapshot.$Properties {
}

/** Represents a PB_RoleBattleSnapshot. */
export class PB_RoleBattleSnapshot {

    /**
     * Constructs a new PB_RoleBattleSnapshot.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_RoleBattleSnapshot.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_RoleBattleSnapshot base_info. */
    base_info?: (PB_RoleBaseInfo.$Properties|null);

    /** PB_RoleBattleSnapshot hero. */
    hero?: (PB_HeroListData.$Properties|null);

    /** PB_RoleBattleSnapshot lineup. */
    lineup?: (PB_LineupListData.$Properties|null);

    /**
     * Creates a new PB_RoleBattleSnapshot instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_RoleBattleSnapshot instance
     */
    static create(properties: PB_RoleBattleSnapshot.$Shape): PB_RoleBattleSnapshot & PB_RoleBattleSnapshot.$Shape;
    static create(properties?: PB_RoleBattleSnapshot.$Properties): PB_RoleBattleSnapshot;

    /**
     * Encodes the specified PB_RoleBattleSnapshot message. Does not implicitly {@link PB_RoleBattleSnapshot.verify|verify} messages.
     * @param message PB_RoleBattleSnapshot message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_RoleBattleSnapshot.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_RoleBattleSnapshot message, length delimited. Does not implicitly {@link PB_RoleBattleSnapshot.verify|verify} messages.
     * @param message PB_RoleBattleSnapshot message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_RoleBattleSnapshot.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_RoleBattleSnapshot message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_RoleBattleSnapshot & PB_RoleBattleSnapshot.$Shape} PB_RoleBattleSnapshot
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_RoleBattleSnapshot & PB_RoleBattleSnapshot.$Shape;

    /**
     * Decodes a PB_RoleBattleSnapshot message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_RoleBattleSnapshot & PB_RoleBattleSnapshot.$Shape} PB_RoleBattleSnapshot
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_RoleBattleSnapshot & PB_RoleBattleSnapshot.$Shape;

    /**
     * Verifies a PB_RoleBattleSnapshot message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_RoleBattleSnapshot message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_RoleBattleSnapshot
     */
    static fromObject(object: { [k: string]: any }): PB_RoleBattleSnapshot;

    /**
     * Creates a plain object from a PB_RoleBattleSnapshot message. Also converts values to other types if specified.
     * @param message PB_RoleBattleSnapshot
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_RoleBattleSnapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_RoleBattleSnapshot to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_RoleBattleSnapshot
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_RoleBattleSnapshot {

    /** Properties of a PB_RoleBattleSnapshot. */
    interface $Properties {

        /** PB_RoleBattleSnapshot base_info */
        base_info?: (PB_RoleBaseInfo.$Properties|null);

        /** PB_RoleBattleSnapshot hero */
        hero?: (PB_HeroListData.$Properties|null);

        /** PB_RoleBattleSnapshot lineup */
        lineup?: (PB_LineupListData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_RoleBattleSnapshot. */
    type $Shape = PB_RoleBattleSnapshot.$Properties;
}

/**
 * Properties of a PB_RoleData.
 * @deprecated Use PB_RoleData.$Properties instead.
 */
export interface IPB_RoleData extends PB_RoleData.$Properties {
}

/** Represents a PB_RoleData. */
export class PB_RoleData {

    /**
     * Constructs a new PB_RoleData.
     * @param [properties] Properties to set
     */
    constructor(properties?: PB_RoleData.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** PB_RoleData base_info. */
    base_info?: (PB_RoleBaseInfo.$Properties|null);

    /** PB_RoleData knapsack. */
    knapsack?: (PB_KnapsackData.$Properties|null);

    /** PB_RoleData growth. */
    growth?: (PB_RoleGrowthData.$Properties|null);

    /** PB_RoleData mmo. */
    mmo?: (PB_MmoRoleData.$Properties|null);

    /**
     * Creates a new PB_RoleData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB_RoleData instance
     */
    static create(properties: PB_RoleData.$Shape): PB_RoleData & PB_RoleData.$Shape;
    static create(properties?: PB_RoleData.$Properties): PB_RoleData;

    /**
     * Encodes the specified PB_RoleData message. Does not implicitly {@link PB_RoleData.verify|verify} messages.
     * @param message PB_RoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: PB_RoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB_RoleData message, length delimited. Does not implicitly {@link PB_RoleData.verify|verify} messages.
     * @param message PB_RoleData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: PB_RoleData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB_RoleData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {PB_RoleData & PB_RoleData.$Shape} PB_RoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB_RoleData & PB_RoleData.$Shape;

    /**
     * Decodes a PB_RoleData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {PB_RoleData & PB_RoleData.$Shape} PB_RoleData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB_RoleData & PB_RoleData.$Shape;

    /**
     * Verifies a PB_RoleData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB_RoleData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB_RoleData
     */
    static fromObject(object: { [k: string]: any }): PB_RoleData;

    /**
     * Creates a plain object from a PB_RoleData message. Also converts values to other types if specified.
     * @param message PB_RoleData
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: PB_RoleData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB_RoleData to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for PB_RoleData
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace PB_RoleData {

    /** Properties of a PB_RoleData. */
    interface $Properties {

        /** PB_RoleData base_info */
        base_info?: (PB_RoleBaseInfo.$Properties|null);

        /** PB_RoleData knapsack */
        knapsack?: (PB_KnapsackData.$Properties|null);

        /** PB_RoleData growth */
        growth?: (PB_RoleGrowthData.$Properties|null);

        /** PB_RoleData mmo */
        mmo?: (PB_MmoRoleData.$Properties|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a PB_RoleData. */
    type $Shape = PB_RoleData.$Properties;
}

/**
 * Properties of a P_ZoneActivityNotify.
 * @deprecated Use P_ZoneActivityNotify.$Properties instead.
 */
export interface IP_ZoneActivityNotify extends P_ZoneActivityNotify.$Properties {
}

/** Represents a P_ZoneActivityNotify. */
export class P_ZoneActivityNotify {

    /**
     * Constructs a new P_ZoneActivityNotify.
     * @param [properties] Properties to set
     */
    constructor(properties?: P_ZoneActivityNotify.$Properties);

    /** Unknown fields preserved while decoding when enabled */
    $unknowns?: Uint8Array[];

    /** P_ZoneActivityNotify activity_id. */
    activity_id?: (number|null);

    /** P_ZoneActivityNotify name. */
    name?: (string|null);

    /** P_ZoneActivityNotify zone_id. */
    zone_id?: (number|null);

    /**
     * Creates a new P_ZoneActivityNotify instance using the specified properties.
     * @param [properties] Properties to set
     * @returns P_ZoneActivityNotify instance
     */
    static create(properties: P_ZoneActivityNotify.$Shape): P_ZoneActivityNotify & P_ZoneActivityNotify.$Shape;
    static create(properties?: P_ZoneActivityNotify.$Properties): P_ZoneActivityNotify;

    /**
     * Encodes the specified P_ZoneActivityNotify message. Does not implicitly {@link P_ZoneActivityNotify.verify|verify} messages.
     * @param message P_ZoneActivityNotify message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(message: P_ZoneActivityNotify.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified P_ZoneActivityNotify message, length delimited. Does not implicitly {@link P_ZoneActivityNotify.verify|verify} messages.
     * @param message P_ZoneActivityNotify message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(message: P_ZoneActivityNotify.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a P_ZoneActivityNotify message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {P_ZoneActivityNotify & P_ZoneActivityNotify.$Shape} P_ZoneActivityNotify
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): P_ZoneActivityNotify & P_ZoneActivityNotify.$Shape;

    /**
     * Decodes a P_ZoneActivityNotify message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {P_ZoneActivityNotify & P_ZoneActivityNotify.$Shape} P_ZoneActivityNotify
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): P_ZoneActivityNotify & P_ZoneActivityNotify.$Shape;

    /**
     * Verifies a P_ZoneActivityNotify message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a P_ZoneActivityNotify message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns P_ZoneActivityNotify
     */
    static fromObject(object: { [k: string]: any }): P_ZoneActivityNotify;

    /**
     * Creates a plain object from a P_ZoneActivityNotify message. Also converts values to other types if specified.
     * @param message P_ZoneActivityNotify
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(message: P_ZoneActivityNotify, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this P_ZoneActivityNotify to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for P_ZoneActivityNotify
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
}

export namespace P_ZoneActivityNotify {

    /** Properties of a P_ZoneActivityNotify. */
    interface $Properties {

        /** P_ZoneActivityNotify activity_id */
        activity_id?: (number|null);

        /** P_ZoneActivityNotify name */
        name?: (string|null);

        /** P_ZoneActivityNotify zone_id */
        zone_id?: (number|null);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];
    }

    /** Shape of a P_ZoneActivityNotify. */
    type $Shape = P_ZoneActivityNotify.$Properties;
}
