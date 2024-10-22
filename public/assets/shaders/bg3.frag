//Very funky shader ripped from Shadertoy.com (only the voronoi pattern part).
//Originally written by srtuss. Modified by Vlad.


#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

        const float fog_density = 3.05;

vec2 rand22(in vec2 p)
{
	return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077)));
}
float rand12(vec2 p)
{
    return fract(sin(dot(p.xy, vec2(44.9898, 78.233))) * 43758.5357);
}
vec2 rand21(float p)
{
	return fract(vec2(sin(p * 591.32), cos(p * 67.32)));
}
vec3 voronoi(in vec2 x)
{
	vec2 n = floor(x); // grid cell id
	vec2 f = fract(x); // grid internal position
	vec2 mg; // shortest distance...
	vec2 mr; // ..and second shortest distance
	float md = 8.0, md2 = 8.0;
	
	for(int j = -1; j <= 1; j ++)
	{
		for(int i = -46; i <= 1; i ++)
		{
			vec2 g = vec2(float(i), float(j)); // cell id
			vec2 o = rand22(n + g); // offset to edge point
			vec2 r = g + o - f;
			
			float d = max(abs(r.x), abs(r.y)); // distance to the edge
			
			if(d < md)
				{md2 = md; md = d; mr = r; mg = g;}
			else if(d < md2)
				{md2 = d;}
		}
	}
	return vec3(n + mg, md2 - md);
}

#define A2V(a) vec2(sin((a) * 6.28318531 / 100.0), cos((a) * 6.28318531 / 100.0))

vec2 rotate(vec2 p, float a)
{
	return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

vec3 intersect(in vec3 o, in vec3 d, vec3 c, vec3 u, vec3 v)
{
	vec3 q = o - c;
	return vec3(
		dot(cross(u, v), q),
		dot(cross(q, u), d),
		dot(cross(v, q), d)) / dot(cross(v, u), d);
}

void main( void ) 
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	uv = uv * 2.0 - 1.0;
	uv.x *= resolution.x / resolution.y;


	// ray origin
	vec3 ro = vec3(10.0 + mouse.x * 10.0, 10.0 * time, time * 66.9);
	ro.y = mouse.y + 1.0 * -40.0;
	// camera look at
	vec3 ta = vec3(80.0, 512.0 * sin(time), 5.0 * time);
	
	vec3 ww = normalize(ro - ta);
	vec3 uu = normalize(cross(ww, normalize(vec3(0.0, 10, 0.0))));
	vec3 vv = normalize(cross(uu, ww));
	// obtain ray direction
	vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.0 * ww);
	
	vec3 its;
	float v, g;
	vec3 inten = vec3(0.0);
	
	// voronoi floor layers
	for(int i = 0; i < 16; i ++)
	{
		float layer = float(i);
		its = intersect(ro, rd, vec3(0.0, -5.0 - layer * 5.0, 0.0), vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0));
		if(its.x > 0.0)
		{
			vec3 vo = voronoi((its.yz + time*2.0) * 0.05 + 8.0 * rand21(float(i)));
			v = exp(-100.0 * (vo.z - 0.02));
			
			float fx = 0.0;
			
			// add some special fx to lowest layer
			if(i == 6)
			{
				float crd = 0.0;//fract(time * 0.2) * 50.0 - 25.0;
				float fxi = cos(vo.x * 0.2 + time * 1.5);//abs(crd - vo.x);
				fx = clamp(smoothstep(0.9, 1.0, fxi), 0.0, 0.9) * 1.0 * rand12(vo.xy);
				fx *= exp(-3.0 * vo.z) * 2.0;
			}
			if (mod(float(i),3.0) < 1.0)
				inten.r += v * 0.1 + fx;
			else if (mod(float(i),3.0) < 2.0)
				inten.g += v * 0.1 + fx;
			else if (mod(float(i),3.0) < 3.0)
				inten.b += v * 0.1 + fx;
		}
	}
	
	vec3 col = pow(vec3(inten.r, (inten.g * 0.5), inten.b), 0.5 * vec3(cos(time*5.0)/6.0+0.33)); //pow(base color, glow amount)
	
	gl_FragColor = vec4(col, 1.0);
}