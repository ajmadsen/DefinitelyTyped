// Type definitions for styled-components 4.1
// Project: https://github.com/styled-components/styled-components, https://styled-components.com
// Definitions by: Igor Oleinikov <https://github.com/Igorbek>
//                 Ihor Chulinda <https://github.com/Igmat>
//                 Adam Lavin <https://github.com/lavoaster>
//                 Jessica Franco <https://github.com/Jessidhia>
//                 Jason Killian <https://github.com/jkillian>
//                 Sebastian Silbermann <https://github.com/eps1lon>
//                 David Ruisinger <https://github.com/flavordaaave>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.9

// forward declarations
declare global {
    namespace NodeJS {
        // tslint:disable-next-line:no-empty-interface
        interface ReadableStream {}
    }
}

import * as CSS from "csstype";
import * as React from "react";

export type CSSObject = CSS.Properties<string | number> &
    // Index type to allow selector nesting
    // This is "[key in string]" and not "[key: string]" to allow CSSObject to be self-referential
    {
        // we need the CSS.Properties in here too to ensure the index signature doesn't create impossible values
        [key in string]:
            | CSS.Properties<string | number>[keyof CSS.Properties<
                  string | number
              >]
            | CSSObject
    };
export type CSSKeyframes = object & { [key: string]: CSSObject };

export interface ThemeProps<T> {
    theme: T;
}

export type ThemedStyledProps<P, T> = P & ThemeProps<T>;
export type StyledProps<P> = ThemedStyledProps<P, AnyIfEmpty<DefaultTheme>>;

// Any prop that has a default prop becomes optional, but its type is unchanged
// Undeclared default props are augmented into the resulting allowable attributes
// If declared props have indexed properties, ignore default props entirely as keyof gets widened
// Wrap in an outer-level conditional type to allow distribution over props that are unions
type Defaultize<P, D> = P extends any
    ? string extends keyof P ? P :
        & Pick<P, Exclude<keyof P, keyof D>>
        & Partial<Pick<P, Extract<keyof P, keyof D>>>
        & Partial<Pick<D, Exclude<keyof D, keyof P>>>
    : never;

type ReactDefaultizedProps<C, P> = C extends { defaultProps: infer D; }
    ? Defaultize<P, D>
    : P;

// Omit props from P that are also contained in O. Follows similar logic to Defaultize
type OmitOverlapping<P, O> = P extends any
    ? string extends keyof P
        ? P
        : Pick<P, Exclude<keyof P, keyof O>>
    : never;

type MergedComponentPropsWithRef<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    O extends object
> = OmitOverlapping<StyledComponentPropsWithRef<C>, O> & O;

export type StyledComponentProps<
    // The Component from whose props are derived
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    // The Theme from the current context
    T extends object,
    // The other props added by the template
    O extends object,
    // The props that are made optional by .attrs
    A extends keyof any
> = WithOptionalTheme<
    Omit<
        ReactDefaultizedProps<
            C,
            MergedComponentPropsWithRef<C, O>
        >,
        A
    > & Partial<Pick<MergedComponentPropsWithRef<C, O>, A>>,
    T
> & WithChildrenIfReactComponentClass<C>;

// Because of React typing quirks, when getting props from a React.ComponentClass,
// we need to manually add a `children` field.
// See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/31945
// and https://github.com/DefinitelyTyped/DefinitelyTyped/pull/32843
type WithChildrenIfReactComponentClass<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>
> = C extends React.ComponentClass<any> ? { children?: React.ReactNode } : {};

type StyledComponentPropsWithAs<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object,
    A extends keyof any
> = StyledComponentProps<C, T, O, A> & { as?: C };

export type FalseyValue = undefined | null | false;
export type Interpolation<P> =
    | InterpolationValue
    | FlattenInterpolation<P>
    | InterpolationFunction<P>;
// must be an interface to be self-referential
export interface FlattenInterpolation<P>
    extends ReadonlyArray<Interpolation<P>> {}
export type InterpolationValue =
    | string
    | number
    | FalseyValue
    | Keyframes
    | StyledComponentInterpolation
    | CSSObject;
export type SimpleInterpolation =
    | InterpolationValue
    | FlattenSimpleInterpolation;
// must be an interface to be self-referential
export interface FlattenSimpleInterpolation
    extends ReadonlyArray<SimpleInterpolation> {}

export type InterpolationFunction<P> = (props: P) => Interpolation<P>;

type Attrs<P, A extends Partial<P>, T> =
    | ((props: ThemedStyledProps<P, T>) => A)
    | A;
type DeprecatedAttrs<P, A extends Partial<P>, T> = {
    [K in keyof A]: ((props: ThemedStyledProps<P, T>) => A[K]) | A[K]
};

export type ThemedGlobalStyledClassProps<P, T> = WithOptionalTheme<P, T> & {
    suppressMultiMountWarning?: boolean;
};

export interface GlobalStyleComponent<P, T>
    extends React.ComponentClass<ThemedGlobalStyledClassProps<P, T>> {}

// remove the call signature from StyledComponent so Interpolation can still infer InterpolationFunction
type StyledComponentInterpolation =
    | Pick<
          StyledComponentBase<any, any, any, any>,
          keyof StyledComponentBase<any, any>
      >
    | Pick<
          StyledComponentBase<any, any, any>,
          keyof StyledComponentBase<any, any>
      >;

// abuse Pick to strip the call signature from ForwardRefExoticComponent
type ForwardRefExoticBase<P> = Pick<
    React.ForwardRefExoticComponent<P>,
    keyof React.ForwardRefExoticComponent<any>
>;

// extracts React defaultProps
type ReactDefaultProps<C> = C extends { defaultProps: infer D; } ? D : never;

// any doesn't count as assignable to never in the extends clause, and we default A to never
export type AnyStyledComponent =
    | StyledComponent<any, any, any, any>
    | StyledComponent<any, any, any>;

export type StyledComponent<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object = {},
    A extends keyof any = never
> = // the "string" allows this to be used as an object key
    // I really want to avoid this if possible but it's the only way to use nesting with object styles...
    string & StyledComponentBase<C, T, O, A>;

export interface StyledComponentBase<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object = {},
    A extends keyof any = never
> extends ForwardRefExoticBase<StyledComponentProps<C, T, O, A>> {
    // add our own fake call signature to implement the polymorphic 'as' prop
    // NOTE: TS <3.2 will refuse to infer the generic and this component becomes impossible to use in JSX
    // just the presence of the overload is enough to break JSX
    //
    // TODO (TypeScript 3.2): actually makes the 'as' prop polymorphic
    // (
    //     props: StyledComponentProps<C, T, O, A> & { as?: never }
    //   ): React.ReactElement<StyledComponentProps<C, T, O, A>>
    // <AsC extends keyof JSX.IntrinsicElements | React.ComponentType<any> = C>(
    //   props: StyledComponentPropsWithAs<AsC, T, O, A>
    // ): React.ReactElement<StyledComponentPropsWithAs<AsC, T, O, A>>

    // TODO (TypeScript 3.2): delete this overload
    (
        props: StyledComponentProps<C, T, O, A> & {
            /**
             * Typing Note: prefer using .withComponent for now as it is actually type-safe.
             *
             * String types need to be cast to themselves to become literal types (as={'a' as 'a'}).
             */
            as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
        }
    ): React.ReactElement<StyledComponentProps<C, T, O, A>>;

    withComponent<WithC extends AnyStyledComponent>(
        component: WithC
    ): StyledComponent<
        StyledComponentInnerComponent<WithC>,
        T,
        O & StyledComponentInnerOtherProps<WithC>,
        A | StyledComponentInnerAttrs<WithC>
    >;
    withComponent<
        WithC extends keyof JSX.IntrinsicElements | React.ComponentType<any>
    >(
        component: WithC
    ): StyledComponent<WithC, T, O, A>;
}

export interface ThemedStyledFunctionBase<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object = {},
    A extends keyof any = never
> {
    (first: TemplateStringsArray): StyledComponent<C, T, O, A>;
    (
        first:
            | TemplateStringsArray
            | CSSObject
            | InterpolationFunction<
                  ThemedStyledProps<MergedComponentPropsWithRef<C, O>, T>
              >,
        ...rest: Array<
            Interpolation<
                ThemedStyledProps<MergedComponentPropsWithRef<C, O>, T>
            >
        >
    ): StyledComponent<C, T, O, A>;
    <U extends object>(
        first:
            | TemplateStringsArray
            | CSSObject
            | InterpolationFunction<
                ThemedStyledProps<OmitOverlapping<MergedComponentPropsWithRef<C, O>, U> & U, T>
              >,
        ...rest: Array<
            Interpolation<
                ThemedStyledProps<OmitOverlapping<MergedComponentPropsWithRef<C, O>, U> & U, T>
            >
        >
    ): StyledComponent<C, T, O & U, A>;
}

// When accepting attrs, ensure the types of existing props do not get changed
type MergeNewAttrs<O, NewA> =
    O & Pick<NewA, Exclude<keyof NewA, keyof O>>;

export interface ThemedStyledFunction<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object = {},
    A extends keyof any = never
> extends ThemedStyledFunctionBase<C, T, O, A> {
    // Fun thing: 'attrs' can also provide a polymorphic 'as' prop
    // My head already hurts enough so maybe later...
    attrs<
        U,
        NewA extends Partial<OmitOverlapping<MergedComponentPropsWithRef<C, O>, U> & U> & {
            [others: string]: any;
        } = {}
    >(
        attrs: Attrs<OmitOverlapping<MergedComponentPropsWithRef<C, O>, U> & U, NewA, T>
    ): ThemedStyledFunction<C, T, MergeNewAttrs<O, NewA>, A | keyof NewA>;
    // Only this overload is deprecated
    // tslint:disable:unified-signatures
    /** @deprecated Prefer using the new single function style, to be removed in v5 */
    attrs<
        U,
        NewA extends Partial<OmitOverlapping<MergedComponentPropsWithRef<C, O>, U> & U> & {
            [others: string]: any;
        } = {}
    >(
        attrs: DeprecatedAttrs<OmitOverlapping<MergedComponentPropsWithRef<C, O>, U> & U, NewA, T>
    ): ThemedStyledFunction<C, T, MergeNewAttrs<O, NewA>, A | keyof NewA>;
    // tslint:enable:unified-signatures
}

export type StyledFunction<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>
> = ThemedStyledFunction<C, any>;

type ThemedStyledComponentFactories<T extends object> = {
    [TTag in keyof JSX.IntrinsicElements]: ThemedStyledFunction<TTag, T>
};

export type StyledComponentInnerComponent<
    C extends React.ComponentType<any>
> = C extends
    | StyledComponent<infer I, any, any, any>
    | StyledComponent<infer I, any, any>
    ? I
    : C;
export type StyledComponentPropsWithRef<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>
> = C extends AnyStyledComponent
    ? React.ComponentPropsWithRef<StyledComponentInnerComponent<C>>
    : React.ComponentPropsWithRef<C>;
export type StyledComponentInnerOtherProps<C extends AnyStyledComponent> = C extends
    | StyledComponent<any, any, infer O, any>
    | StyledComponent<any, any, infer O>
    ? O
    : never;
export type StyledComponentInnerAttrs<
    C extends AnyStyledComponent
> = C extends StyledComponent<any, any, any, infer A> ? A : never;

export interface ThemedBaseStyledInterface<T extends object>
    extends ThemedStyledComponentFactories<T> {
    <C extends AnyStyledComponent>(component: C): ThemedStyledFunction<
        StyledComponentInnerComponent<C>,
        T,
        StyledComponentInnerOtherProps<C>,
        StyledComponentInnerAttrs<C>
    >;
    <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>>(
        // unfortunately using a conditional type to validate that it can receive a `theme?: Theme`
        // causes tests to fail in TS 3.1
        component: C
    ): ThemedStyledFunction<C, T>;
}

export type ThemedStyledInterface<T extends object> = ThemedBaseStyledInterface<
    AnyIfEmpty<T>
>;
export type StyledInterface = ThemedStyledInterface<DefaultTheme>;

export interface BaseThemedCssFunction<T extends object> {
    (
        first: TemplateStringsArray | CSSObject,
        ...interpolations: SimpleInterpolation[]
    ): FlattenSimpleInterpolation;
    (
        first:
            | TemplateStringsArray
            | CSSObject
            | InterpolationFunction<ThemedStyledProps<{}, T>>,
        ...interpolations: Array<Interpolation<ThemedStyledProps<{}, T>>>
    ): FlattenInterpolation<ThemedStyledProps<{}, T>>;
    <P extends object>(
        first:
            | TemplateStringsArray
            | CSSObject
            | InterpolationFunction<ThemedStyledProps<P, T>>,
        ...interpolations: Array<Interpolation<ThemedStyledProps<P, T>>>
    ): FlattenInterpolation<ThemedStyledProps<P, T>>;
}

export type ThemedCssFunction<T extends object> = BaseThemedCssFunction<
    AnyIfEmpty<T>
>;

// Helper type operators
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type WithOptionalTheme<P extends { theme?: T }, T> = Omit<P, "theme"> & {
    theme?: T;
};
type AnyIfEmpty<T extends object> = keyof T extends never ? any : T;

export interface ThemedStyledComponentsModule<
    T extends object,
    U extends object = T
> {
    default: ThemedStyledInterface<T>;

    css: ThemedCssFunction<T>;

    // unfortunately keyframes can't interpolate props from the theme
    keyframes(
        strings: TemplateStringsArray | CSSKeyframes,
        ...interpolations: SimpleInterpolation[]
    ): Keyframes;

    createGlobalStyle<P extends object = {}>(
        first:
            | TemplateStringsArray
            | CSSObject
            | InterpolationFunction<ThemedStyledProps<P, T>>,
        ...interpolations: Array<Interpolation<ThemedStyledProps<P, T>>>
    ): GlobalStyleComponent<P, T>;

    withTheme: WithThemeFnInterface<T>;
    ThemeProvider: ThemeProviderComponent<T, U>;
    ThemeConsumer: React.Consumer<T>;
    ThemeContext: React.Context<T>;

    // This could be made to assert `target is StyledComponent<any, T>` instead, but that feels not type safe
    isStyledComponent: typeof isStyledComponent;

    ServerStyleSheet: typeof ServerStyleSheet;
    StyleSheetManager: typeof StyleSheetManager;
}

declare const styled: StyledInterface;

export const css: ThemedCssFunction<DefaultTheme>;

export type BaseWithThemeFnInterface<T extends object> = <
    C extends React.ComponentType<any>
>(
    // this check is roundabout because the extends clause above would
    // not allow any component that accepts _more_ than theme as a prop
    component: React.ComponentProps<C> extends { theme?: T } ? C : never
) => React.ForwardRefExoticComponent<
    WithOptionalTheme<React.ComponentPropsWithRef<C>, T>
>;
export type WithThemeFnInterface<T extends object> = BaseWithThemeFnInterface<
    AnyIfEmpty<T>
>;
export const withTheme: WithThemeFnInterface<DefaultTheme>;

/**
 * This interface can be augmented by users to add types to `styled-components`' default theme
 * without needing to reexport `ThemedStyledComponentsModule`.
 */
// Unfortunately, there is no way to write tests for this
// as any augmentation will break the tests for the default case (not augmented).
// tslint:disable-next-line:no-empty-interface
export interface DefaultTheme {}

export interface ThemeProviderProps<T extends object, U extends object = T> {
    children?: React.ReactChild; // only one child is allowed, goes through React.Children.only
    theme: T | ((theme: U) => T);
}
export type BaseThemeProviderComponent<
    T extends object,
    U extends object = T
> = React.ComponentClass<ThemeProviderProps<T, U>>;
export type ThemeProviderComponent<
    T extends object,
    U extends object = T
> = BaseThemeProviderComponent<AnyIfEmpty<T>, AnyIfEmpty<U>>;
export const ThemeProvider: ThemeProviderComponent<AnyIfEmpty<DefaultTheme>>;
// NOTE: this technically starts as undefined, but allowing undefined is unhelpful when used correctly
export const ThemeContext: React.Context<AnyIfEmpty<DefaultTheme>>;
export const ThemeConsumer: typeof ThemeContext["Consumer"];

export interface Keyframes {
    getName(): string;
}

export function keyframes(
    strings: TemplateStringsArray | CSSKeyframes,
    ...interpolations: SimpleInterpolation[]
): Keyframes;

export function createGlobalStyle<P extends object = {}>(
    first:
        | TemplateStringsArray
        | CSSObject
        | InterpolationFunction<ThemedStyledProps<P, DefaultTheme>>,
    ...interpolations: Array<Interpolation<ThemedStyledProps<P, DefaultTheme>>>
): GlobalStyleComponent<P, DefaultTheme>;

export function isStyledComponent(
    target: any
): target is StyledComponent<any, any>;

export class ServerStyleSheet {
    collectStyles(
        tree: React.ReactNode
    ): React.ReactElement<{ sheet: ServerStyleSheet }>;

    getStyleTags(): string;
    getStyleElement(): Array<React.ReactElement<{}>>;
    interleaveWithNodeStream(
        readableStream: NodeJS.ReadableStream
    ): NodeJS.ReadableStream;
    readonly instance: this;
    seal(): void;
}

type StyleSheetManagerProps =
    | {
          sheet: ServerStyleSheet;
          target?: never;
      }
    | {
          sheet?: never;
          target: HTMLElement;
      };

export class StyleSheetManager extends React.Component<
    StyleSheetManagerProps
> {}

/**
 * The CSS prop is not declared by default in the types as it would cause 'css' to be present
 * on the types of anything that uses styled-components indirectly, even if they do not use the
 * babel plugin.
 *
 * You can load a default declaration by using writing this special import from
 * a typescript file. This module does not exist in reality, which is why the {} is important:
 *
 * ```ts
 * import {} from 'styled-components/cssprop'
 * ```
 *
 * Or you can declare your own module augmentation, which allows you to specify the type of Theme:
 *
 * ```ts
 * import { CSSProp } from 'styled-components'
 *
 * interface MyTheme {}
 *
 * declare module 'react' {
 *   interface Attributes {
 *     css?: CSSProp<MyTheme>
 *   }
 * }
 * ```
 */
// ONLY string literals and inline invocations of css`` are supported, anything else crashes the plugin
export type CSSProp<T = AnyIfEmpty<DefaultTheme>> =
    | string
    | CSSObject
    | FlattenInterpolation<ThemeProps<T>>;

export default styled;
