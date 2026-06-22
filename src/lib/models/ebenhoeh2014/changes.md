The original model calculates the pH as `log10(proton_concentration)`.
To avoid numerical instabilities, we clamped the pH to the range of 1-14 using `log10(clamp(0.1, proton_concentration, 1e-14))`.
