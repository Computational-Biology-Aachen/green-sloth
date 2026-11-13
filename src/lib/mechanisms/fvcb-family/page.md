## The core model

[Farquhar, von Caemmerer & Berry (1980)](https://doi.org/10.1007/BF00386231) describe net CO₂ assimilation of a C₃ leaf at steady state as the carboxylation rate $V_c$ minus the CO₂ released by photorespiration and day respiration:

$$
A = V_c \left(1 - \frac{\Gamma^\ast}{C}\right) - R_d
$$

$V_c$ is set by whichever process limits it: Rubisco itself (RuBP saturated), or the regeneration of RuBP by electron transport. Everything since has been a variation on three questions: _which limitations exist_, _what feeds them_ (light, temperature, CO₂ at the site), and _how the leaf connects to its environment_ (mesophyll, stomata, canopy). The model is algebraic and has no state variables, which is why it underlies almost every land-surface and crop model.

The [Rubisco page](/mechanisms/rubisco) covers how $W_c$ itself is formulated. This page follows the family's branches. [Yin et al. 2021](https://doi.org/10.1111/pce.14070) review the whole family in one notation and are the recommended entry point. [von Caemmerer 2013](https://doi.org/10.1111/pce.12098) gives consistent C₃ and C₄ equations.

## Limiting rates

- **Rubisco-limited** (RuBP saturated):
  $W_c = \dfrac{V_{c,\max}\, C}{C + K_c(1 + O/K_o)}$
- **RuBP-regeneration-limited** (electron transport): $W_j = \dfrac{J\, C}{4C + 8\Gamma^\ast}$ (see [Electron requirement](#electron-requirement))
- **TPU-limited**: $W_p = \dfrac{3\, T_p}{1 - \Gamma^\ast/C}$, added by [Sharkey 1985](https://doi.org/10.1007/BF02861058) (see [Triose phosphate utilisation](#triose-phosphate-utilisation))

The original 1980 paper has only $W_c$ and $W_j$. GreenSloth's FvCB 1980 implementation also includes $W_p$ with glycerate re-entry ([Harley & Sharkey 1991](https://doi.org/10.1007/BF00035838)) so that the high-CO₂ plateau can be shown. Single-limit models in the database ([Bernacchi 2001](https://doi.org/10.1111/j.1365-3040.2001.00668.x): $W_c$; [June 2004](https://doi.org/10.1071/FP03250): $J$) parameterise only one rate.

## Combining the limits

**min(W).** $V_c = \min(W_c, W_j, W_p)$, then apply the $(1 - \Gamma^\ast/C)$ factor once. This is the form of the original papers.

**min(A).** Compute $A_c$, $A_j$ and $A_p$ separately and take the minimum. It agrees with min(W) as long as every $A_i$ uses the same $(1 - \Gamma^\ast/C)$ factor and $C > \Gamma^\ast$. Below $\Gamma^\ast$ the factor is negative, the minimum picks the wrong limitation, and A–Ci curves deviate at low CO₂. [Lochocki & McGrath 2025](https://doi.org/10.1093/insilicoplants/diaf014) show that this variant is widespread in published code. Use min(W).

**Smoothed (θ).** Replace the hard minimum by a non-rectangular hyperbola, solving $\theta A^2 - (A_c + A_j)A + A_c A_j = 0$ for the smaller root, with $\theta \approx 0.98$–$0.99$ ([Collatz 1991](<https://doi.org/10.1016/0168-1923(91)90002-8>)). This removes the kink at the transition, which helps optimisers and matches observed co-limitation. _Pitfall:_ $\theta$ lowers $A$ at the transition point, so parameters fitted with min() are not interchangeable with parameters fitted with smoothing.

**Single limit.** Only one rate is modelled, typically to isolate a temperature response.

## Electron requirement

Regenerating one RuBP for carboxylation plus the photorespiratory recycling costs electrons. With 4 e⁻ per NADPH-equivalent pair and NADPH-limited regeneration:

$$
W_j = \frac{J\, C}{4C + 8\Gamma^\ast}
$$

([FvCB 1980](https://doi.org/10.1007/BF00386231), [Harley 1992](https://doi.org/10.1111/j.1365-3040.1992.tb00974.x), [Johnson & Berry 2021](https://doi.org/10.1007/s11120-021-00840-4)). If ATP limits instead, with 3 ATP per CO₂ and a fixed H⁺/ATP ratio, the coefficients become 4.5 and 10.5 ([Bernacchi 2013](https://doi.org/10.1111/pce.12118)). These are two different assumptions about which carrier limits, not two estimates of the same constant.

**Generalised.** [Yin et al. 2004](https://doi.org/10.1111/j.1365-3040.2004.01224.x) express $W_j$ in terms of the fraction of cyclic electron flow, the Q-cycle and pseudocyclic flow, which recovers both of the classic forms as special cases.

## Light response of J

**J given.** $J$ is a parameter. This is acceptable for A–Ci curves at saturating light.

**Rectangular hyperbola.** For example, $J = \dfrac{I\, J_{\max}}{I + 2.1\, J_{\max}}$ (FvCB 1980).

**Non-rectangular hyperbola.** The most common form, with curvature $\theta$ and quantum yield $\alpha$ ([Farquhar & Wong 1984](https://doi.org/10.1071/PP9840191)):

$$
\theta J^2 - (\alpha I + J_{\max}) J + \alpha I J_{\max} = 0
$$

[Harley 1992](https://doi.org/10.1111/j.1365-3040.1992.tb00974.x) uses the related Smith function $J = \alpha I / \sqrt{1 + (\alpha I / J_{\max})^2}$.

**From ΦPSII.** $J = \Phi_\mathrm{PSII}\, \beta\, \alpha_\mathrm{leaf}\, I$ from chlorophyll fluorescence ([Yin 2009](https://doi.org/10.1111/j.1365-3040.2009.01934.x), [June 2004](https://doi.org/10.1071/FP03250), [Han 2022](https://doi.org/10.1111/nph.18045)). This links gas exchange to PAM data.

**Mechanistic light reactions.** $J$ follows from a steady-state model of the photosystems, the PQ pool and cytochrome b₆f, including the redox state and NPQ ([Gu 2019](https://doi.org/10.1111/nph.15796), [Gu 2023](https://doi.org/10.1111/pce.14563), [Johnson & Berry 2021](https://doi.org/10.1007/s11120-021-00840-4)). This is the bridge from FvCB to the kinetic thylakoid models.

## Triose phosphate utilisation

At high CO₂, the export and use of triose phosphate can limit photosynthesis and release inorganic phosphate too slowly. $A$ then becomes insensitive to CO₂ and even to O₂.

**Wp = 3 TPU.** $A_p = 3\, T_p - R_d$ ([Sharkey 1985](https://doi.org/10.1007/BF02861058)). Land-surface models often tie $T_p$ to $V_{c,\max}$ ([Lombardozzi 2018](https://doi.org/10.1088/1748-9326/aacf68)). Whether global models need TPU at all is still debated ([Rogers 2021](https://doi.org/10.1111/nph.17092), [Gregory 2021](https://doi.org/10.1111/pce.14153)).

**Glycerate re-entry (α).** A fraction α of glycolate carbon leaves the photorespiratory cycle and does not return as glycerate, so oxygenation can relieve TPU limitation. This explains reversed O₂ sensitivity ([Harley & Sharkey 1991](https://doi.org/10.1007/BF00035838)).

**Glycine/serine export (αG, αS).** Carbon leaves photorespiration as glycine or serine, coupling photorespiration to nitrogen assimilation and changing $W_c$, $W_j$ and $W_p$ ([Busch 2018](https://doi.org/10.1038/s41477-017-0065-x), [McClain & Sharkey 2019](https://doi.org/10.1093/jxb/erz058)).

## Finite mesophyll conductance

**Infinite gm (Ci).** The classic simplification: Rubisco sees $C_i$. All kinetic constants are then apparent values on a $C_i$ basis.

**Finite gm (Cc).** $C_c = C_i - A/g_m$. Substituting into $W_c$ or $W_j$ turns each limitation into a quadratic in $A$ ([Ethier & Livingston 2004](https://doi.org/10.1111/j.1365-3040.2004.01140.x), [von Caemmerer 2009](https://doi.org/10.1007/978-1-4020-9237-4_9)). $g_m$ is temperature-dependent ([Bernacchi 2002](https://doi.org/10.1104/pp.008250)), and the response differs between species.

**Resistance pathway / refixation.** (Photo)respiratory CO₂ is released in the mitochondria, not at Rubisco, so part of it is refixed before it escapes. Splitting $g_m$ into cell-wall and chloroplast components and adding a refixation fraction makes the apparent $g_m$ vary with CO₂ and O₂ ([Tholen 2012](https://doi.org/10.1111/j.1365-3040.2012.02538.x), [Busch 2013](https://doi.org/10.1111/j.1365-3040.2012.02567.x), [Yin & Struik 2017](https://doi.org/10.1007/s11120-017-0340-8)). Together with a rising $C_c$ at low light, this explains much of the Kok effect without changing day respiration ([Farquhar & Busch 2017](https://doi.org/10.1111/nph.14512)).

**gm from anatomy.** A one-dimensional gas- and liquid-phase diffusion model that computes $g_m$ from cell-wall thickness, chloroplast surface area and membrane permeabilities ([Niinemets & Reichstein 2003](https://doi.org/10.1029/2002JD002620), [Tomás 2013](https://doi.org/10.1093/jxb/ert086)).

## Temperature

**Arrhenius.** $k(T) = k_{25} \exp\!\left[\frac{\Delta H_a (T - 298.15)}{298.15\, R\, T}\right]$ ([Bernacchi 2001](https://doi.org/10.1111/j.1365-3040.2001.00668.x) for $V_{c,\max}$, $K_c$, $K_o$ and $\Gamma^\ast$ measured in vivo on a $C_i$ basis). _Pitfall:_ Bernacchi 2001 parameters assume infinite $g_m$. On a $C_c$ basis, use [Bernacchi 2002](https://doi.org/10.1104/pp.008250) or [Walker 2013](https://doi.org/10.1111/pce.12166).

**Peaked Arrhenius.** Adds high-temperature deactivation, mainly for $J_{\max}$ and $V_{c,\max}$ ([Harley 1985](https://doi.org/10.1007/BF00395048), [Medlyn 2002](https://doi.org/10.1046/j.1365-3040.2002.00891.x)):

$$
k(T) = k_{25} \exp\!\left[\frac{\Delta H_a (T - 298.15)}{298.15\, R\, T}\right]
\frac{1 + \exp\!\left(\frac{298.15\, \Delta S - \Delta H_d}{298.15\, R}\right)}{1 + \exp\!\left(\frac{T\, \Delta S - \Delta H_d}{R\, T}\right)}
$$

**Gaussian.** $J(T) = J_\mathrm{opt} \exp\!\left[-\left(\frac{T - T_\mathrm{opt}}{\Omega}\right)^2\right]$, a simpler peaked form with directly interpretable parameters ([June 2004](https://doi.org/10.1071/FP03250)).

**Growth-temperature acclimation.** The deactivation entropy $\Delta S$ (and so $T_\mathrm{opt}$) shifts with growth temperature ([Kattge & Knorr 2007](https://doi.org/10.1111/j.1365-3040.2007.01690.x), [Kumarathunge 2019](https://doi.org/10.1111/nph.15668)). This matters when the model runs over seasons or across climates.

## Stomatal coupling

Without stomata, $C_i$ is an input. Coupling makes $C_i$ an outcome: $A = g_s (C_a - C_i)/1.6$, with $g_s$ itself depending on $A$. This creates a fixed point that must be solved iteratively or in closed form.

**Fick's law, gs given.** [von Caemmerer & Farquhar 1981](https://doi.org/10.1007/BF00384257) derive $C_i$ from measured $A$, $E$ and $g_s$. This is the basis of every gas-exchange system.

**Ball–Berry.** $g_s = g_0 + g_1\, A\, h_s / C_s$ (Ball, Woodrow & Berry 1987). Used by [Collatz 1991](<https://doi.org/10.1016/0168-1923(91)90002-8>) and [Harley 1992](https://doi.org/10.1111/j.1365-3040.1992.tb00974.x). GreenSloth's Harley 1992 solves the coupling in closed form, as a quadratic in $C_i$.

**Leuning.** Replaces relative humidity with a vapour-pressure-deficit response and uses $C_s - \Gamma$ ([Leuning 1995](https://doi.org/10.1111/j.1365-3040.1995.tb00370.x)).

**Medlyn (USO).** $g_s = g_0 + 1.6\left(1 + g_1/\sqrt{D}\right) A / C_a$, derived from optimal stomatal behaviour ([Medlyn 2011](https://doi.org/10.1111/j.1365-2486.2010.02375.x)). [Duursma 2015](https://doi.org/10.1371/journal.pone.0143346) (plantecophys) is a well-documented reference implementation with an analytical $C_i$ solution.

**Leaf energy balance.** Leaf temperature is solved together with transpiration and the boundary layer, rather than being prescribed ([Collatz 1991](<https://doi.org/10.1016/0168-1923(91)90002-8>)).

## Canopy scaling

**Leaf.** All models in GreenSloth are leaf models.

**Sun/shade canopy.** The canopy is treated as two big leaves, sunlit and shaded, each with its own absorbed light and nitrogen-scaled $V_{c,\max}$ and $J_{\max}$ ([de Pury & Farquhar 1997](https://doi.org/10.1111/j.1365-3040.1997.00094.x)). This avoids the bias of a single big leaf without resolving many layers.

## Isotope discrimination

The ¹³C discrimination $\Delta$ of a leaf records the CO₂ drawdown from air to Rubisco. In its simplest form $\Delta = a + (b - a)\, C_c / C_a$ ([Farquhar, O'Leary & Berry 1982](https://doi.org/10.1071/PP9820121)), with additional terms for mesophyll diffusion, respiration and photorespiration. [Busch 2020](https://doi.org/10.1038/s41477-020-0606-6) rederives the model with a separate respiratory carbon pool, which gives sensible $g_m$ estimates at low $A$. [Ubierna 2019](https://doi.org/10.1007/s11120-019-00635-8) adds the chloroplast–mitochondria arrangement. Isotope models need outputs (Δ, δ¹³C) that no GreenSloth model has yet.

## Beyond C₃

The C₄ counterparts follow the same pattern: [Collatz, Ribas-Carbo & Berry 1992](https://doi.org/10.1071/PP9920519) for the coupled leaf, von Caemmerer's model with bundle-sheath leakiness (2000 book; updated in [von Caemmerer 2021](https://doi.org/10.1093/jxb/erab266)), and [Yin & Struik 2012](https://doi.org/10.1111/j.1365-3040.2012.02490.x) and [2018](https://doi.org/10.1111/nph.15051) for C₄ electron transport. They are outside this page's scope.
