// ======================================
// ER175A CVT ENGINE SIMULATOR
// ======================================



// ======================================
// SCORE LIMITER
// ======================================


function limitScore(value){

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(value)
        )
    );

}



// ======================================
// ESTIMATES
// ======================================


function estimateSpeed(score){


    if(score >=95)
        return "95-105 km/h";


    if(score >=85)
        return "85-95 km/h";


    if(score >=70)
        return "80-90 km/h";


    return "75-85 km/h";

}



function estimateAcceleration(score){


    if(score >=95)
        return "6.0-6.8 sec";


    if(score >=85)
        return "7.0-7.8 sec";


    if(score >=70)
        return "8.0-8.8 sec";


    return "9+ sec";


}



// ======================================
// CHARACTER DESCRIPTION
// ======================================


function getCVTCharacter(
    roller,
    center,
    clutch
){


    let result=[];


    if(roller <=13)

        result.push(
        "Quick acceleration"
        );


    else if(roller >=15)

        result.push(
        "Relaxed cruising"
        );


    else

        result.push(
        "Balanced response"
        );



    if(center >=1500)

        result.push(
        "strong uphill pulling"
        );


    if(clutch >=1500)

        result.push(
        "higher launch RPM"
        );



    return result.join(", ");

}



// ======================================
// RIDING STYLE
// ======================================


function getRidingStyle(
    roller,
    center
){


    if(center >=1500)

        return "Uphill, passenger use, heavy load";


    if(roller >=15)

        return "Highway cruising and fuel economy";


    if(roller <=13)

        return "City riding and quick response";


    return "Daily mixed riding";


}